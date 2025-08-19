import clientPromise from '@/lib/mongodb';
import InteractionsTable from './InteractionsTable';
import InteractionFilter from './InteractionFilter';

export interface FlatInteraction {
  _id: string;
  customer_name: string;
  interaction_date: string;
  start_time: string;
  end_time: string;
  audio_file: string;
  interaction_sentiment_analysis: string;
  agent_notes: string;
  followup_required: boolean;
  followup_date: string;
  cost: number; // Assuming cost is a number
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

async function getInteractions(
  filterDate?: string,
  customerName?: string,
  customerEmail?: string,
  customerPhone?: string,
  page: number = 1,
  limit: number = 10
): Promise<FlatInteraction[]> {
  const client = await clientPromise;
  const db = client.db('debt_collection_agency');

  let customerMatch: any = {};
  const andConditions: any[] = [];
  if (customerName) {
    const nameParts = customerName.trim().split(/\s+/);
    andConditions.push(...nameParts.map(part => ({
      $or: [
        { 'customer_info.first_name': { $regex: part, $options: 'i' } },
        { 'customer_info.last_name': { $regex: part, $options: 'i' } },
      ],
    })));
  }
  if (customerEmail) {
    andConditions.push({ 'customer_info.email': { $regex: customerEmail, $options: 'i' } });
  }
  if (customerPhone) {
    andConditions.push({ 'customer_info.mob_number': { $regex: customerPhone, $options: 'i' } });
  }
  if (andConditions.length > 0) {
    customerMatch.$and = andConditions;
  }

  const pipeline: any[] = [
    {
      $lookup: {
        from: 'customers',
        let: { customer_id_str: '$customer_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [ '$_id', { $toObjectId: '$$customer_id_str' } ]
              }
            }
          }
        ],
        as: 'customer_info'
      }
    },
    { $unwind: '$customer_info' },
    { $match: customerMatch },
    { $unwind: '$interactions' },
  ];

  if (filterDate) {
    const startDate = new Date(filterDate);
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(filterDate);
    endDate.setUTCHours(23, 59, 59, 999);

    pipeline.push({
      $addFields: {
        'interactions.interaction_date_converted': { $toDate: '$interactions.interaction_date' }
      }
    });
    pipeline.push({
      $match: {
        'interactions.interaction_date_converted': {
          $gte: startDate,
          $lt: endDate,
        }
      }
    });
  }

  pipeline.push(
    {
      $project: {
        _id: { $toString: '$interactions._id' },
        customer_name: { $concat: ['$customer_info.first_name', ' ', '$customer_info.last_name'] },
        interaction_date: '$interactions.interaction_date',
        start_time: '$interactions.start_time',
        end_time: '$interactions.end_time',
        audio_file: '$interactions.audio_file',
        interaction_sentiment_analysis: '$interactions.interaction_sentiment_analysis',
        agent_notes: '$interactions.agent_notes',
        followup_required: '$interactions.followup_required',
        followup_date: '$interactions.followup_date',
        cost: { $ifNull: ['$interactions.cost', 0] },
        interaction: '$interactions.interaction'
      }
    },
    { $sort: { interaction_date: -1, start_time: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit }
  );

  const interactions = await db.collection('customer_interaction').aggregate(pipeline).toArray();

  return interactions as FlatInteraction[];
}

async function getTotalInteractions(
  filterDate?: string,
  customerName?: string,
  customerEmail?: string,
  customerPhone?: string
): Promise<number> {
  const client = await clientPromise;
  const db = client.db('debt_collection_agency');

  let customerMatch: any = {};
  const andConditions: any[] = [];
  if (customerName) {
    const nameParts = customerName.trim().split(/\s+/);
    andConditions.push(...nameParts.map(part => ({
      $or: [
        { 'customer_info.first_name': { $regex: part, $options: 'i' } },
        { 'customer_info.last_name': { $regex: part, $options: 'i' } },
      ],
    })));
  }
  if (customerEmail) {
    andConditions.push({ 'customer_info.email': { $regex: customerEmail, $options: 'i' } });
  }
  if (customerPhone) {
    andConditions.push({ 'customer_info.mob_number': { $regex: customerPhone, $options: 'i' } });
  }
  if (andConditions.length > 0) {
    customerMatch.$and = andConditions;
  }

  const pipeline: any[] = [
    {
      $lookup: {
        from: 'customers',
        let: { customer_id_str: '$customer_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [ '$_id', { $toObjectId: '$$customer_id_str' } ]
              }
            }
          }
        ],
        as: 'customer_info'
      }
    },
    { $unwind: '$customer_info' },
    { $match: customerMatch },
    { $unwind: '$interactions' },
  ];

  if (filterDate) {
    const startDate = new Date(filterDate);
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(filterDate);
    endDate.setUTCHours(23, 59, 59, 999);

    pipeline.push({
      $addFields: {
        'interactions.interaction_date_converted': { $toDate: '$interactions.interaction_date' }
      }
    });
    pipeline.push({
      $match: {
        'interactions.interaction_date_converted': {
          $gte: startDate,
          $lt: endDate,
        }
      }
    });
  }

  pipeline.push({ $count: 'total' });

  const result = await db.collection('customer_interaction').aggregate(pipeline).toArray();

  return result.length > 0 ? result[0].total : 0;
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