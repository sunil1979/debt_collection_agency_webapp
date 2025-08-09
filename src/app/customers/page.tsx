import clientPromise from '@/lib/mongodb';
import CustomerTable from './CustomerTable';

interface Customer {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  mob_number: string;
  debt_details: {
    total_outstanding: number;
  };
  id: string;
}

async function getTotalCustomers(): Promise<number> {
  const client = await clientPromise;
  const db = client.db('debt_collection_agency');
  const count = await db.collection('customers').countDocuments();
  return count;
}

async function getCustomers(page: number, limit: number): Promise<Customer[]> {
  const client = await clientPromise;
  const db = client.db('debt_collection_agency');
  const customers = await db.collection('customers').find({}).skip((page - 1) * limit).limit(limit).toArray();
  return customers.map((customer: any) => ({
    ...customer,
    _id: customer._id.toString(),
    id: customer._id.toString(), // Ensure 'id' is also present and is a string
    first_name: customer.first_name || '',
    last_name: customer.last_name || '',
    email: customer.email || '',
    mob_number: customer.mob_number || '',
    debt_details: customer.debt_details || { total_outstanding: 0 },
  }));
}

export default async function CustomersPage({ searchParams }: { searchParams: { page?: string; limit?: string } }) {
  const page = parseInt(searchParams.page || '1');
  const limit = parseInt(searchParams.limit || '10');

  const customers = await getCustomers(page, limit);
  const totalCustomers = await getTotalCustomers();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-4">Customers</h1>
      <CustomerTable customers={customers} totalCustomers={totalCustomers} page={page} limit={limit} />
    </div>
  );
}
