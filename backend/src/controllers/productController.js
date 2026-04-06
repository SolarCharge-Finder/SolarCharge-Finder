import Product from '../models/Product.js';

const IMAGE_EXT_PATTERN = /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i;

const toAbsoluteUrl = (candidate, baseUrl) => {
  try {
    return new URL(candidate, baseUrl).toString();
  } catch {
    return '';
  }
};

const extractImageFromHtml = (html, sourceUrl) => {
  const patterns = [
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]*content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:image(?::secure_url)?["'][^>]*>/i,
    /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]*content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]*name=["']twitter:image(?::src)?["'][^>]*>/i,
    /<img[^>]+src=["']([^"']+)["'][^>]*>/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    const candidate = match?.[1]?.trim();
    if (!candidate) continue;
    const absolute = toAbsoluteUrl(candidate, sourceUrl);
    if (absolute) return absolute;
  }

  return '';
};

const isHttpUrl = value => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const resolveProductImageUrl = async (req, res) => {
  try {
    const sourceUrl = String(req.query?.url || '').trim();

    if (!sourceUrl || !isHttpUrl(sourceUrl)) {
      return res.status(400).json({ message: 'Please provide a valid image or webpage URL.' });
    }

    if (IMAGE_EXT_PATTERN.test(sourceUrl)) {
      return res.status(200).json({ imageUrl: sourceUrl, sourceUrl, resolved: false });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const headResponse = await fetch(sourceUrl, {
        method: 'HEAD',
        redirect: 'follow',
        signal: controller.signal,
      });
      const contentType = headResponse.headers.get('content-type') || '';
      if (contentType.toLowerCase().startsWith('image/')) {
        return res.status(200).json({
          imageUrl: headResponse.url || sourceUrl,
          sourceUrl,
          resolved: false,
        });
      }
    } catch {
      // Ignore HEAD failures and fall back to HTML parsing.
    }

    const pageResponse = await fetch(sourceUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
    });
    const html = await pageResponse.text();
    const extracted = extractImageFromHtml(html, pageResponse.url || sourceUrl);

    if (!extracted) {
      return res.status(400).json({
        message: 'No preview image found on that page. Please paste a direct image link.',
      });
    }

    return res.status(200).json({
      imageUrl: extracted,
      sourceUrl,
      resolved: true,
    });
  } catch (error) {
    console.error('Resolve product image URL error:', error);
    return res.status(500).json({ message: 'Unable to resolve image URL right now.' });
  }
};

const parseArrayQuery = value => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
};

const normalizeSpecs = specs => {
  if (specs && typeof specs === 'object' && !Array.isArray(specs)) return specs;
  if (typeof specs === 'string') return specs.trim();
  return {};
};

const validatePayload = payload => {
  const errors = [];
  if (!payload.name || payload.name.trim().length < 5) {
    errors.push('Product name must be at least 5 characters.');
  }
  if (!payload.shortDescription) {
    errors.push('Short description is required.');
  }
  if (!payload.fullDescription) {
    errors.push('Full description is required.');
  }
  if (!payload.category) {
    errors.push('Category is required.');
  }
  if (payload.price === undefined || Number(payload.price) <= 0) {
    errors.push('Price must be a positive number.');
  }
  if (payload.rating !== undefined && (payload.rating < 0 || payload.rating > 5)) {
    errors.push('Rating must be between 0 and 5.');
  }
  if (payload.stockQuantity !== undefined && payload.stockQuantity < 0) {
    errors.push('Stock quantity cannot be negative.');
  }
  if (!Array.isArray(payload.imageUrls) || payload.imageUrls.length === 0) {
    errors.push('At least one product image is required.');
  }
  return errors;
};

export const createProduct = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      name: req.body.name?.trim(),
      shortDescription: req.body.shortDescription?.trim(),
      fullDescription: req.body.fullDescription?.trim(),
      brand: req.body.brand?.trim(),
      technicalSpecifications: normalizeSpecs(req.body.technicalSpecifications),
    };

    const errors = validatePayload(payload);
    if (errors.length) {
      return res.status(400).json({ message: errors.join(' ') });
    }

    const product = await Product.create({
      ...payload,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, availabilityStatus, brand, minRating, sort } =
      req.query;
    const query = {};

    if (category) {
      const categories = parseArrayQuery(category);
      if (categories.length) query.category = { $in: categories };
    }

    if (availabilityStatus) {
      const statuses = parseArrayQuery(availabilityStatus);
      if (statuses.length) query.availabilityStatus = { $in: statuses };
    }

    if (brand) {
      const brands = parseArrayQuery(brand);
      if (brands.length) query.brand = { $in: brands };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    if (search) {
      query.$text = { $search: search };
    }

    let cursor = Product.find(query);

    if (sort === 'price-asc') cursor = cursor.sort({ price: 1 });
    if (sort === 'price-desc') cursor = cursor.sort({ price: -1 });
    if (sort === 'rating') cursor = cursor.sort({ rating: -1 });
    if (sort === 'newest') cursor = cursor.sort({ createdAt: -1 });

    const products = await cursor.exec();
    return res.status(200).json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ products });
  } catch (error) {
    console.error('Get my products error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(200).json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const isOwner = product.createdBy?.toString() === req.user._id.toString();
    const isAdmin = req.user.role?.toLowerCase() === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updates = {
      ...req.body,
      name: req.body.name?.trim(),
      shortDescription: req.body.shortDescription?.trim(),
      fullDescription: req.body.fullDescription?.trim(),
      brand: req.body.brand?.trim(),
    };

    if (updates.technicalSpecifications !== undefined) {
      updates.technicalSpecifications = normalizeSpecs(updates.technicalSpecifications);
    }

    const candidate = {
      name: updates.name ?? product.name,
      shortDescription: updates.shortDescription ?? product.shortDescription,
      fullDescription: updates.fullDescription ?? product.fullDescription,
      category: updates.category ?? product.category,
      price: updates.price ?? product.price,
      rating: updates.rating ?? product.rating,
      stockQuantity: updates.stockQuantity ?? product.stockQuantity,
      imageUrls: updates.imageUrls ?? product.imageUrls,
    };

    const errors = validatePayload(candidate);
    if (errors.length) {
      return res.status(400).json({ message: errors.join(' ') });
    }

    Object.assign(product, updates);
    const saved = await product.save();
    return res.status(200).json({ message: 'Product updated successfully', product: saved });
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const isOwner = product.createdBy?.toString() === req.user._id.toString();
    const isAdmin = req.user.role?.toLowerCase() === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await product.deleteOne();
    return res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const addProductReview = async (req, res) => {
  try {
    const { id } = req.params;
    const rating = Number(req.body?.rating);
    const comment = String(req.body?.comment ?? '').trim();

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const alreadyReviewed = product.reviews.some(
      review => review.user?.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You already reviewed this product.' });
    }

    product.reviews.push({
      user: req.user._id,
      name: req.user.name || req.user.email?.split('@')[0] || 'Customer',
      rating,
      comment,
    });

    const total = product.reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
    product.rating = Number((total / product.reviews.length).toFixed(1));

    const saved = await product.save();

    return res.status(201).json({
      message: 'Review added successfully',
      product: saved,
    });
  } catch (error) {
    console.error('Add product review error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
