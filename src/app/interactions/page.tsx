import clientPromise from '@/lib/mongodb';
import InteractionsTable from './InteractionsTable';
import InteractionFilter from './InteractionFilter';
import { ObjectId } from 'mongodb';

interface Interaction {
  interaction_date: string;
  start_time: string;
  end_time: string;
  agent_id: string;
  agent_name: string;
  job_id: string;
  audio_file: string;
  interaction_sentiment_analysis: string;
  agent_notes: string;
  followup_required: boolean;
  followup_date: string;
  interaction: {
    items: {
      id: string;
      type: string;
      role: 'agent' | 'customer';
      content: string[];
      interrupted: boolean;
      transcript_confidence: number;
    }[];
  };
}

interface CustomerInteraction {
  _id: string;
  customer_id: string;
  customer_name?: string;
  interactions: Interaction[];
}

async function getInteractions(
  filterDate?: string,
  customerName?: string,
  customerEmail?: string,
  customerPhone?: string,
  page: number = 1,
  limit: number = 10
): Promise<CustomerInteraction[]> {
  const client = await clientPromise;
  const db = client.db('debt_collection_agency');

  let customerQuery: any = {};
  if (customerName) {
    customerQuery.$or = [
      { first_name: { $regex: customerName, $options: 'i' } },
      { last_name: { $regex: customerName, $options: 'i' } },
    ];
  }
  if (customerEmail) {
    customerQuery.email = { $regex: customerEmail, $options: 'i' };
  }
  if (customerPhone) {
    customerQuery.mob_number = { $regex: customerPhone, $options: 'i' };
  }

  const customers = await db.collection('customers').find(customerQuery).toArray();
  const customerMap = new Map(customers.map(c => [c._id.toString(), `${c.first_name} ${c.last_name}`]));
  const filteredCustomerIds = Array.from(customerMap.keys());

  let interactionQuery: any = {};
  if (Object.keys(customerQuery).length > 0) {
    if (filteredCustomerIds.length === 0) {
      return []; // No customers matched, so no interactions
    }
    interactionQuery.customer_id = { $in: filteredCustomerIds };
  }

  const interactions = await db.collection('customer_interaction').find(interactionQuery).skip((page - 1) * limit).limit(limit).toArray();

  const finalInteractions = interactions.map((customerInteraction: any) => ({
    ...customerInteraction,
    _id: customerInteraction._id.toString(),
    customer_name: customerMap.get(customerInteraction.customer_id) || 'Unknown Customer',
    interactions: customerInteraction.interactions.filter((interaction: any) =>
      filterDate ? interaction.interaction_date.startsWith(filterDate) : true
    ),
  })).filter(customerInteraction => customerInteraction.interactions.length > 0);

  return finalInteractions.sort((a, b) => {
    const latestA = a.interactions.reduce((maxDateTime, interaction) => {
      const currentDateTime = `${interaction.interaction_date} ${interaction.start_time}`;
      return currentDateTime > maxDateTime ? currentDateTime : maxDateTime;
    }, '');
    const latestB = b.interactions.reduce((maxDateTime, interaction) => {
      const currentDateTime = `${interaction.interaction_date} ${interaction.start_time}`;
      return currentDateTime > maxDateTime ? currentDateTime : maxDateTime;
    }, '');
    return latestB.localeCompare(latestA); // Sort in descending order (most recent first)
  });
}

async function getTotalInteractions(
  filterDate?: string,
  customerName?: string,
  customerEmail?: string,
  customerPhone?: string
): Promise<number> {
  const client = await clientPromise;
  const db = client.db('debt_collection_agency');

  let customerQuery: any = {};
  if (customerName) {
    customerQuery.$or = [
      { first_name: { $regex: customerName, $options: 'i' } },
      { last_name: { $regex: customerName, $options: 'i' } },
    ];
  }
  if (customerEmail) {
    customerQuery.email = { $regex: customerEmail, $options: 'i' };
  }
  if (customerPhone) {
    customerQuery.mob_number = { $regex: customerPhone, $options: 'i' };
  }

  const customers = await db.collection('customers').find(customerQuery).toArray();
  const filteredCustomerIds = Array.from(new Map(customers.map(c => [c._id.toString(), `${c.first_name} ${c.last_name}`])).keys());

  let interactionQuery: any = {};
  if (Object.keys(customerQuery).length > 0) {
    if (filteredCustomerIds.length === 0) {
      return 0;
    }
    interactionQuery.customer_id = { $in: filteredCustomerIds };
  }

  const interactions = await db.collection('customer_interaction').find(interactionQuery).toArray();

  const filteredCount = interactions.filter((customerInteraction: any) =>
    customerInteraction.interactions.some((interaction: any) =>
      filterDate ? interaction.interaction_date.startsWith(filterDate) : true
    )
  ).length;

  return filteredCount;
}

export default async function InteractionsPage({ searchParams }: { searchParams: { date?: string; customerName?: string; customerEmail?: string; customerPhone?: string; page?: string; limit?: string } }) {
  const filterDate = searchParams.date || '';
  const customerName = searchParams.customerName || '';
  const customerEmail = searchParams.customerEmail || '';
  const customerPhone = searchParams.customerPhone || '';
  const page = parseInt(searchParams.page || '1');
  const limit = parseInt(searchParams.limit || '10');

  const interactions = await getInteractions(filterDate, customerName, customerEmail, customerPhone, page, limit);
  const totalInteractions = await getTotalInteractions(filterDate, customerName, customerEmail, customerPhone);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-4">Interactions</h1>
      <InteractionFilter />
      <InteractionsTable interactions={interactions} page={page} limit={limit} totalInteractions={totalInteractions} />
    </div>
  );
}