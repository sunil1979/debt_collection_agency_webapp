import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

async function getCustomer(id: string) {
  const client = await clientPromise;
  const db = client.db('debt_collection_agency');
  const customer = await db.collection('customers').findOne({ _id: new ObjectId(id) });
  return JSON.parse(JSON.stringify(customer));
}

interface CustomerDetailsPageProps {
  params: { id: string };
}

export default async function CustomerDetailsPage({ params }: CustomerDetailsPageProps) {
  const customer = await getCustomer(params.id);

  if (!customer) {
    return <div>Customer not found</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-4">{customer.first_name} {customer.last_name}</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Customer Details</h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Full name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{customer.first_name} {customer.middle_name} {customer.last_name}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{customer.email}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Phone number</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{customer.mob_number}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{customer.house_number} {customer.street_name}, {customer.suburb}, {customer.state} {customer.post_code}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Total Outstanding</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{customer.debt_details.total_outstanding}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
