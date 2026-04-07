import AdminSidebar from '../../components/admin/AdminSidebar';
import ProductSellRequest from '../../components/marketplace/ProductSellRequest';
import '../../styles/admin.css';

function ManageSellRequests() {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <header className="admin-header">
          <div className="admin-header__title">
            <p className="admin-card__title">Admin Panel</p>
            <h1>Manage Sell Requests</h1>
            <p className="admin-card__title" style={{ marginTop: '0.5rem' }}>
              Only admin users can create and manage marketplace item listings.
            </p>
          </div>
        </header>

        <section className="admin-panel">
          <ProductSellRequest />
        </section>
      </main>
    </div>
  );
}

export default ManageSellRequests;
