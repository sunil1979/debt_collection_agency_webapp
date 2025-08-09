
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

async function getInteractions(filterDate?: string, customerName?: string, page: number = 1, limit: number = 10): Promise<CustomerInteraction[]> {
  const client = await clientPromise;
  const db = client.db('debt_collection_agency');

  let customerQuery: any = {};
  if (customerName) {
    customerQuery = {
      $or: [
        { first_name: { $regex: customerName, $options: 'i' } },
        { last_name: { $regex: customerName, $options: 'i' } },
      ],
    };
  }

  const customers = await db.collection('customers').find(customerQuery).toArray();
  const customerMap = new Map(customers.map(c => [c._id.toString(), `${c.first_name} ${c.last_name}`]));
  const filteredCustomerIds = Array.from(customerMap.keys());

  let interactionQuery: any = {};
  if (filteredCustomerIds.length > 0) {
    interactionQuery.customer_id = { $in: filteredCustomerIds };
  } else if (customerName) {
    // If a customer name was provided but no customers matched, return empty interactions
    return [];
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

async function getTotalInteractions(filterDate?: string, customerName?: string): Promise<number> {
  const client = await clientPromise;
  const db = client.db('debt_collection_agency');

  let customerQuery: any = {};
  if (customerName) {
    customerQuery = {
      $or: [
        { first_name: { $regex: customerName, $options: 'i' } },
        { last_name: { $regex: customerName, $options: 'i' } },
      ],
    };
  }

  const customers = await db.collection('customers').find(customerQuery).toArray();
  const filteredCustomerIds = Array.from(new Map(customers.map(c => [c._id.toString(), `${c.first_name} ${c.last_name}`])).keys());

  let interactionQuery: any = {};
  if (filteredCustomerIds.length > 0) {
    interactionQuery.customer_id = { $in: filteredCustomerIds };
  } else if (customerName) {
    return 0;
  }

  const interactions = await db.collection('customer_interaction').find(interactionQuery).toArray();

  const filteredCount = interactions.filter((customerInteraction: any) =>
    customerInteraction.interactions.some((interaction: any) =>
      filterDate ? interaction.interaction_date.startsWith(filterDate) : true
    )
  ).length;

  return filteredCount;
}

export default async function InteractionsPage({ searchParams }: { searchParams: { date?: string; customerName?: string; page?: string; limit?: string } }) {
  console.log('InteractionsPage re-rendering with searchParams:', searchParams);
  const filterDate = searchParams.date || new Date().toISOString().split('T')[0];
  const customerName = searchParams.customerName || '';
  const page = parseInt(searchParams.page || '1');
  const limit = parseInt(searchParams.limit || '10');

  const interactions = await getInteractions(filterDate, customerName, page, limit);
  const totalInteractions = await getTotalInteractions(filterDate, customerName);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-4">Interactions</h1>
      <InteractionFilter />
      <InteractionsTable interactions={interactions} page={page} limit={limit} totalInteractions={totalInteractions} />
    </div>
  );
}
