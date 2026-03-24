import ChargingStationModel from '../models/ChargingStationModel.js';
import { success, fail } from '../utils/responseHelper.js';

// Create stations
export const createChargingStation = async (req, res, next) => {
  try {
    const {
      name,
      description,
      address,
      city,
      district,
      status,
      latitude,
      longitude,
      connectors,
      photos,
    } = req.body;

    //validations
    if (!name) return fail(res, { message: 'Station name is required', status: 400 });
    if (latitude === undefined || longitude === undefined)
      return fail(res, { message: 'latitude and longitude are required', status: 400 });

    if (!Array.isArray(connectors) || connectors.length === 0)
      return fail(res, { message: 'At least one connectors required', status: 400 });

    const station = await ChargingStationModel.create({
      name,
      description,
      address,
      city,
      district,
      status,
      location: {
        type: 'Point',
        coordinates: [Number(longitude), Number(latitude)],
      },
      connectors,
      photos: Array.isArray(photos) ? photos : [],
    });

    return success(res, {
      status: 201,
      message: 'Charging station created successfully',
      data: station,
    });
  } catch (err) {
    next(err);
  }
};

//GET all stations
export const getChargingStations = async (req, res, next) => {
  try {
    const { excludePhotos } = req.query;

    // If excludePhotos=true, exclude the photos field to speed up loading
    const selectFields = excludePhotos === 'true' ? '-photos' : '';

    const stations = await ChargingStationModel.find().select(selectFields).sort({ createdAt: -1 });

    return success(res, { status: 200, count: stations.length, data: stations });
  } catch (err) {
    next(err);
  }
};

//Get station by id
export const getChargingStationById = async (req, res, next) => {
  try {
    const station = await ChargingStationModel.findById(req.params.id);

    if (!station) {
      return fail(res, { message: 'Charging station not found', status: 404 });
    }

    return success(res, { status: 200, data: station });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid station id' });
    }
    next(err);
  }
};

//Update station

export const updateChargingStation = async (req, res, next) => {
  try {
    const stationId = req.params.id;

    const { latitude, longitude, connectors, photos, ...rest } = req.body;

    const updateData = { ...rest };

    //if lat/lng provided - update location
    if (latitude !== undefined && longitude !== undefined) {
      updateData.location = {
        type: 'Point',
        coordinates: [Number(longitude), Number(latitude)],
      };
    }

    //if connecctors privided, replace connectors
    if (connectors !== undefined) {
      if (!Array.isArray(connectors) || connectors.length === 0) {
        return fail(res, { message: 'At least one connector is required', status: 400 });
      }

      for (const c of connectors) {
        if (c.totalSlots <= 0) {
          return fail(res, {
            message: `totalSlots must be greater than 0 for ${c.type}`,
            status: 400,
          });
        }
        if (c.availableSlots < 0) {
          return fail(res, {
            message: `availableSlots cannot be negative for ${c.type}`,
            status: 400,
          });
        }
        if (c.availableSlots > c.totalSlots) {
          return fail(res, {
            message: `availableSlots cannot be greater than totalSlots for ${c.type}`,
            status: 400,
          });
        }
      }

      updateData.connectors = connectors;
    }

    //if photo provided, replace photos
    if (photos !== undefined) {
      updateData.photos = Array.isArray(photos) ? photos : [];
    }

    const updated = await ChargingStationModel.findByIdAndUpdate(stationId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return fail(res, { message: 'Charging station not found', status: 404 });
    }

    return success(res, {
      status: 200,
      message: 'Charging station updated successfully',
      data: updated,
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return fail(res, { message: 'Invalid station id', status: 400 });
    }

    // Check for MongoDB GeoJSON validation errors
    if (
      err.message &&
      (err.message.includes('longitude') ||
        err.message.includes('latitude') ||
        err.message.includes('coordinates'))
    ) {
      return fail(res, {
        message:
          'Invalid location. Latitude must be between -90 and 90, longitude between -180 and 180',
        status: 400,
      });
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
      return fail(res, { message: err.message, status: 400 });
    }

    console.error('Update station error:', err);
    next(err);
  }
};

//delete stations

export const deleteChargingStation = async (req, res, _next) => {
  try {
    const deleted = await ChargingStationModel.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return fail(res, { message: 'Charging station not found', status: 404 });
    }
    return success(res, { status: 200, message: 'Charging staton deleted successfully.' });
  } catch (err) {
    if (err.name === 'CastError') {
      return fail(res, { message: 'Invalid station id', status: 400 });
    }
  }
};
