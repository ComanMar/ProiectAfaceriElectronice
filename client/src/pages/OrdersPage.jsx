import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { fetchOrders, deleteOrder, updateOrder, addProductToOrder } from '../api/order.routes';
import LoadingSpinner from '../components/LoadingSpinner';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const user = useSelector((state) => state.user.user);
  const isAdmin = user?.role === 'admin';
  const navigate = useNavigate();

  useEffect(() => {
    const getOrders = async () => {
      try {
        setLoading(true);
        const {data} = await fetchOrders();
        if (data && Array.isArray(data)) {
          setOrders(data);
        } else {
          setError('Failed to load orders');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching orders');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    getOrders();
  }, []);

  const handleEditClick = (orderId) => {
    navigate(`/orders/edit/${orderId}`);
  };

  const handleDeleteClick = async (orderId) => {
    if (!confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      setDeletingId(orderId);
      const response = await deleteOrder(orderId);

      if (response?.success) {
        setOrders(orders.filter((o) => o.id !== orderId));
        toast.success('Order deleted successfully');
      } else {
        toast.error(response?.message || 'Failed to delete order');
      }
    } catch (err) {
      toast.error(err.message || 'An error occurred while deleting the order');
    } finally {
      setDeletingId(null);
    }
  };

const handleIncreaseQuantity = async (orderId, currentQuantity) => {
  try {
    const response = await updateOrder(orderId, { quantity: currentQuantity + 1 });
    
    if (response?.success) {
      toast.success('Quantity increased');
      // Reîncarcă comenzile
      const updatedOrders = await fetchOrders();
      if (updatedOrders?.success) {
        setOrders(updatedOrders.data);
      }
    } else if (response?.message === 'Insufficient stock') {
      toast.error('Insufficient stock to increase quantity');
    } else {
      toast.error(response?.message || 'Failed to update');
    }
  } catch (error) {
    console.error('Error:', error);
    toast.error('Error updating quantity');
  }
};

const handleDecreaseQuantity = async (orderId, currentQuantity) => {
  try {
    if (currentQuantity <= 1) {
      await handleDeleteClick(orderId);
      return;
    }
    const response = await updateOrder(orderId, { quantity: currentQuantity - 1 });
    if (response?.success) {
      toast.success('Quantity decreased');
      // Reîncarcă comenzile
      const updatedOrders = await fetchOrders();
      if (updatedOrders?.success) {
        setOrders(updatedOrders.data);
      }
    } else {
      toast.error(response?.message || 'Failed to update');
    }
  } catch (error) {
    console.error('Error:', error);
    toast.error('Error updating quantity');
  }
};


  const handleCreateClick = () => {
    toast.message('Add products to orders', {
      description: 'Select products from the Products page'
    });
    navigate('/products');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="bg-white h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 font-semibold">No orders available</p>
          {(
            <button
              onClick={handleCreateClick}
              className="mt-4 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Place First Order
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white h-screen overflow-y-auto">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Orders</h2>
          {(
            <button
              onClick={handleCreateClick}
              className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Place Order
            </button>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {orders.map((order) => (
            <div key={order.id} className="group relative">
              <div className="relative">
                <img
                  alt={order.name}
                  src={order.image || 'https://via.placeholder.com/300'}
                  className="aspect-square w-full rounded-md bg-gray-200 object-cover group-hover:opacity-75 lg:aspect-auto lg:h-80 pointer-events-none"
                />
                {(
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                   <button
                      type="button"
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md"
                      onClick={() => handleDecreaseQuantity(order.id, order.quantity)}
                      title="Decrease"
                    >
                      −
                    </button>
                    <button
                      type="button"
                      className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-md"
                      onClick={() => handleIncreaseQuantity(order.id, order.quantity)}
                      title="Increase"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-md shadow-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleDeleteClick(order.id)}
                      disabled={deletingId === order.id}
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <span className="font-semibold w-8 text-center">{order.quantity}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-between">
                <div>
                  <h3 className="text-sm text-gray-700">
                    <a href="#" onClick={(e) => e.preventDefault()}>
                      <span aria-hidden="true" className="absolute inset-0" />
                      {order.name}
                    </a>
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{order.category}</p>
                </div>
                <p className="text-sm font-medium text-gray-900">${order.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
