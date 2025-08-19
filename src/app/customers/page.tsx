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
  lastContactedOn?: string;
  payment_plan?: {
    payment_reference_number: string;
    payment_schedule: {
      payment_date: string;
      amount: number;
      payment_status: string;
    }[];
  };
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

  // 1. Fetch the paginated list of customers
  const customers = await db.collection('customers').find({}).skip((page - 1) * limit).limit(limit).toArray();

  // 2. For each customer, find their latest interaction date
  const customerPromises = customers.map(async (customer) => {
    const customerIdStr = customer._id.toString();

    const latestInteraction = await db.collection('customer_interaction').aggregate([
      { $match: { customer_id: customerIdStr } },
      { $unwind: '$interactions' },
      { $sort: { 'interactions.interaction_date': -1, 'interactions.start_time': -1 } },
      { $limit: 1 },
      { $project: { _id: 0, lastContactedOn: '$interactions.start_time' } }
    ]).toArray();

    const lastContactedOn = latestInteraction.length > 0 ? latestInteraction[0].lastContactedOn : null;

    return {
      ...customer,
      lastContactedOn: lastContactedOn,
    };
  });

  const customersWithInteraction = await Promise.all(customerPromises);

  return customersWithInteraction.map((customer: any) => ({
    ...customer,
    _id: customer._id.toString(),
    id: customer._id.toString(),
    first_name: customer.first_name || '',
    last_name: customer.last_name || '',
    email: customer.email || '',
    mob_number: customer.mob_number || '',
    debt_details: customer.debt_details || { total_outstanding: 0 },
    lastContactedOn: customer.lastContactedOn || null,
    payment_plan: customer.payment_plan || null,
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
