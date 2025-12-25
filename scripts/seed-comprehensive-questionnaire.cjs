require('dotenv').config();
const mongoose = require('mongoose');
const Questionnaire = require('../netlify/functions/models/Questionnaire.js');

const sections = [
  {
    title: 'Executive Summary & Value Discovery',
    order: 0,
    questions: [
      { id: 'exec_1', text: 'What are your top 3 business challenges related to warehouse operations?', type: 'text', required: true, order: 1 },
      { id: 'exec_2', text: 'What are your current annual warehouse operational costs?', type: 'text', required: true, order: 2 },
      { id: 'exec_3', text: 'What is your inventory carrying cost as % of inventory value?', type: 'text', required: true, order: 3 },
      { id: 'exec_4', text: 'What is your current cost per order?', type: 'text', required: true, order: 4 },
      { id: 'exec_5', text: 'What is your current OTIF (On Time In Full) score %?', type: 'text', required: true, order: 5 },
      { id: 'exec_6', text: 'What is your current order fulfillment accuracy rate?', type: 'text', required: true, order: 6 },
      { id: 'exec_7', text: 'What is your current inventory accuracy level (%)?', type: 'text', required: true, order: 7 },
      { id: 'exec_8', text: 'What is your current returns rate (%)?', type: 'text', required: true, order: 8 },
      { id: 'exec_9', text: 'How many channels do you operate? (B2B, B2C, B2B2C)', type: 'text', required: true, order: 9 },
      { id: 'exec_10', text: 'What is your annual IT spend on warehouse/logistics systems?', type: 'text', required: false, order: 10 },
      { id: 'exec_11', text: 'What is the estimated value of write-off/scrap/damage annually?', type: 'text', required: false, order: 11 },
      { id: 'exec_12', text: 'What is your warehouse capacity utilization %?', type: 'text', required: true, order: 12 }
    ]
  },
  {
    title: 'Objective & Pain Points',
    order: 1,
    questions: [
      { id: 'obj_1', text: 'Provide a high level overview of your business', type: 'text', required: true, order: 1 },
      { id: 'obj_2', text: 'What are your major pains and challenges?', type: 'text', required: true, order: 2 },
      { id: 'obj_3', text: 'Is this a digitalization project?', type: 'boolean', required: true, order: 3 },
      { id: 'obj_4', text: 'Is the organization ready for cloud?', type: 'boolean', required: true, order: 4 },
      { id: 'obj_5', text: 'Status of Project, Timeline, Key Events', type: 'text', required: true, order: 5 },
      { id: 'obj_6', text: 'Is your operation high touch or low touch?', type: 'text', required: true, order: 6 },
      { id: 'obj_7', text: 'What are your top 3 operational inefficiencies?', type: 'text', required: true, order: 7 }
    ]
  },
  {
    title: 'Warehouse Organisation',
    order: 2,
    questions: [
      { id: 'org_1', text: 'Number and size of warehouses/DCs', type: 'text', required: true, order: 1 },
      { id: 'org_2', text: 'Hours of operation for each DC', type: 'text', required: true, order: 2 },
      { id: 'org_3', text: 'Number of bin locations', type: 'text', required: true, order: 3 },
      { id: 'org_4', text: 'List dedicated areas in warehouse (Returns, Inspection, Goods-In, Despatch, Packing, VAS)', type: 'text', required: true, order: 4 },
      { id: 'org_5', text: 'What type of location structures exist? (Flow racks, floor stacked, single pallet racking, VNA, Small Bins)', type: 'text', required: true, order: 5 },
      { id: 'org_6', text: 'Describe automated or material handling equipment', type: 'text', required: false, order: 6 },
      { id: 'org_7', text: 'At what capacity are your warehouses running at?', type: 'text', required: true, order: 7 },
      { id: 'org_8', text: 'What storage systems do you employ?', type: 'text', required: true, order: 8 }
    ]
  },
  {
    title: 'Warehouse Personnel & Equipment',
    order: 3,
    questions: [
      { id: 'per_1', text: 'How many people do you employ to run your warehouse?', type: 'text', required: true, order: 1 },
      { id: 'per_2', text: 'Do you employ any automation at your warehouse? (RF guns, Pick to light, ASRS, Robots, etc)', type: 'text', required: true, order: 2 },
      { id: 'per_3', text: 'What is your FTE % increase over the last year?', type: 'text', required: false, order: 3 },
      { id: 'per_4', text: 'What is your annual overtime as % of total labor cost?', type: 'text', required: false, order: 4 },
      { id: 'per_5', text: 'What is your labor cost per unit shipped?', type: 'text', required: false, order: 5 },
      { id: 'per_6', text: 'Do you track productivity metrics per employee?', type: 'boolean', required: false, order: 6 },
      { id: 'per_7', text: 'Number of MHE (forklifts, pallet jacks, etc)?', type: 'text', required: false, order: 7 },
      { id: 'per_8', text: 'Number of RF devices/scanners?', type: 'text', required: false, order: 8 },
      { id: 'per_9', text: 'Do you use voice picking?', type: 'boolean', required: false, order: 9 },
      { id: 'per_10', text: 'Do you use pick-to-light systems?', type: 'boolean', required: false, order: 10 },
      { id: 'per_11', text: 'Number of accidents per year?', type: 'text', required: false, order: 11 },
      { id: 'per_12', text: 'What is your staff turnover rate %?', type: 'text', required: false, order: 12 }
    ]
  },
  {
    title: 'IT Systems & Integration',
    order: 4,
    questions: [
      { id: 'sys_1', text: 'What system do you currently run to operate your warehouse?', type: 'text', required: true, order: 1 },
      { id: 'sys_2', text: 'Is your current system on-premise, data center, or cloud?', type: 'text', required: true, order: 2 },
      { id: 'sys_3', text: 'How long did it take to implement your current solution?', type: 'text', required: false, order: 3 },
      { id: 'sys_4', text: 'Do you have multiple upstream or downstream systems integrated?', type: 'boolean', required: true, order: 4 },
      { id: 'sys_5', text: 'What tools are you using for integration (EDI, API, Middleware)?', type: 'text', required: false, order: 5 },
      { id: 'sys_6', text: 'Do you have analytics or dashboarding capabilities?', type: 'boolean', required: true, order: 6 },
      { id: 'sys_7', text: 'How many people are tasked to maintain your logistics system?', type: 'text', required: false, order: 7 },
      { id: 'sys_8', text: 'What is your annual IT spend on warehouse systems?', type: 'text', required: false, order: 8 },
      { id: 'sys_9', text: 'Do you have any AI or ML capabilities in your current system?', type: 'boolean', required: false, order: 9 },
      { id: 'sys_10', text: 'What is your current WMS version/release?', type: 'text', required: false, order: 10 },
      { id: 'sys_11', text: 'What ERP system do you use?', type: 'text', required: true, order: 11 },
      { id: 'sys_12', text: 'Do you have real-time integration with ERP?', type: 'boolean', required: false, order: 12 }
    ]
  },
  {
    title: 'Inventory Management',
    order: 5,
    questions: [
      { id: 'inv_1', text: 'Number of stock items (SKUs)', type: 'text', required: true, order: 1 },
      { id: 'inv_2', text: 'Total value of stock items', type: 'text', required: true, order: 2 },
      { id: 'inv_3', text: 'Current inventory accuracy level (%)', type: 'text', required: true, order: 3 },
      { id: 'inv_4', text: 'What is the estimated annual value of write-off/scrap/damage?', type: 'text', required: false, order: 4 },
      { id: 'inv_5', text: 'What is your MISC (Material In Stock Cost)?', type: 'text', required: false, order: 5 },
      { id: 'inv_6', text: 'What is your inventory turnover rate?', type: 'text', required: false, order: 6 },
      { id: 'inv_7', text: 'Do you use ABC classification for inventory?', type: 'boolean', required: false, order: 7 },
      { id: 'inv_8', text: 'What is your stock-out frequency?', type: 'text', required: false, order: 8 },
      { id: 'inv_9', text: 'Do you perform cycle counting?', type: 'boolean', required: true, order: 9 },
      { id: 'inv_10', text: 'How often do you perform physical inventory counts?', type: 'text', required: true, order: 10 },
      { id: 'inv_11', text: 'What is your dead stock percentage?', type: 'text', required: false, order: 11 },
      { id: 'inv_12', text: 'Do you track lot/serial numbers?', type: 'boolean', required: true, order: 12 },
      { id: 'inv_13', text: 'Do you manage expiry dates/shelf life?', type: 'boolean', required: false, order: 13 },
      { id: 'inv_14', text: 'What is your average inventory holding cost as % of inventory value?', type: 'text', required: false, order: 14 },
      { id: 'inv_15', text: 'Do you use FIFO/FEFO/LIFO inventory rotation?', type: 'text', required: true, order: 15 }
    ]
  },
  {
    title: 'Receiving & Inbound Operations',
    order: 6,
    questions: [
      { id: 'rcv_1', text: 'Number of suppliers/vendors', type: 'text', required: true, order: 1 },
      { id: 'rcv_2', text: 'Average delivery lead time (days)', type: 'text', required: true, order: 2 },
      { id: 'rcv_3', text: 'Average number of PO/ASN per day', type: 'text', required: true, order: 3 },
      { id: 'rcv_4', text: 'Average lines per PO/ASN', type: 'text', required: true, order: 4 },
      { id: 'rcv_5', text: 'Average cycle time for putaway (minutes)', type: 'text', required: false, order: 5 },
      { id: 'rcv_6', text: 'What is the cost of inbound operations?', type: 'text', required: false, order: 6 },
      { id: 'rcv_7', text: 'Do you use ASN (Advanced Shipping Notice)?', type: 'boolean', required: true, order: 7 },
      { id: 'rcv_8', text: 'What is your receiving accuracy rate (%)?', type: 'text', required: false, order: 8 },
      { id: 'rcv_9', text: 'Do you perform quality inspection at receiving?', type: 'boolean', required: true, order: 9 },
      { id: 'rcv_10', text: 'What is your average dock-to-stock time (hours)?', type: 'text', required: false, order: 10 },
      { id: 'rcv_11', text: 'Do you have a goods receipt process?', type: 'boolean', required: true, order: 11 },
      { id: 'rcv_12', text: 'What is your receiving dock utilization %?', type: 'text', required: false, order: 12 }
    ]
  },
  {
    title: 'Storage & Putaway',
    order: 7,
    questions: [
      { id: 'sto_1', text: 'Do you use directed putaway?', type: 'boolean', required: true, order: 1 },
      { id: 'sto_2', text: 'Do you use slotting optimization?', type: 'boolean', required: false, order: 2 },
      { id: 'sto_3', text: 'What is your warehouse space utilization %?', type: 'text', required: true, order: 3 },
      { id: 'sto_4', text: 'Do you use dynamic slotting?', type: 'boolean', required: false, order: 4 },
      { id: 'sto_5', text: 'What is your average putaway time per pallet (minutes)?', type: 'text', required: false, order: 5 },
      { id: 'sto_6', text: 'Do you use cross-docking?', type: 'boolean', required: false, order: 6 },
      { id: 'sto_7', text: 'What percentage of items are cross-docked?', type: 'text', required: false, order: 7 },
      { id: 'sto_8', text: 'Do you use zone-based storage strategies?', type: 'boolean', required: false, order: 8 },
      { id: 'sto_9', text: 'Do you use task interleaving for putaway?', type: 'boolean', required: false, order: 9 }
    ]
  },
  {
    title: 'Picking & Packing Operations',
    order: 8,
    questions: [
      { id: 'pck_1', text: 'What picking methods do you use? (Discrete, Batch, Wave, Zone, Cluster)', type: 'text', required: true, order: 1 },
      { id: 'pck_2', text: 'What is your picking accuracy rate (%)?', type: 'text', required: true, order: 2 },
      { id: 'pck_3', text: 'What is your average picks per hour per person?', type: 'text', required: false, order: 3 },
      { id: 'pck_4', text: 'Do you use wave picking?', type: 'boolean', required: false, order: 4 },
      { id: 'pck_5', text: 'Do you use zone picking?', type: 'boolean', required: false, order: 5 },
      { id: 'pck_6', text: 'What is your average order cycle time (minutes)?', type: 'text', required: true, order: 6 },
      { id: 'pck_7', text: 'Do you perform kitting or assembly operations?', type: 'boolean', required: false, order: 7 },
      { id: 'pck_8', text: 'Do you offer value-added services (VAS)?', type: 'boolean', required: false, order: 8 },
      { id: 'pck_9', text: 'What is your packing station efficiency (orders/hour)?', type: 'text', required: false, order: 9 },
      { id: 'pck_10', text: 'Do you use automated packing systems?', type: 'boolean', required: false, order: 10 },
      { id: 'pck_11', text: 'What is your mis-pick rate (%)?', type: 'text', required: false, order: 11 },
      { id: 'pck_12', text: 'Do you use cartonization/packaging optimization?', type: 'boolean', required: false, order: 12 },
      { id: 'pck_13', text: 'Do you use task interleaving for picking?', type: 'boolean', required: false, order: 13 }
    ]
  },
  {
    title: 'Shipping & Outbound Operations',
    order: 9,
    questions: [
      { id: 'shp_1', text: 'How many distribution channels do you operate? (B2B, B2C, B2B2C)', type: 'text', required: true, order: 1 },
      { id: 'shp_2', text: 'Average number of sales orders per day', type: 'text', required: true, order: 2 },
      { id: 'shp_3', text: 'Average lines per sales order', type: 'text', required: true, order: 3 },
      { id: 'shp_4', text: 'Average cycle time for order fulfillment (hours)', type: 'text', required: false, order: 4 },
      { id: 'shp_5', text: 'What is the cost of outbound operations?', type: 'text', required: false, order: 5 },
      { id: 'shp_6', text: 'What is your on-time shipping rate (%)?', type: 'text', required: true, order: 6 },
      { id: 'shp_7', text: 'Do you use multi-carrier shipping?', type: 'boolean', required: false, order: 7 },
      { id: 'shp_8', text: 'Do you have TMS (Transportation Management System) integration?', type: 'boolean', required: false, order: 8 },
      { id: 'shp_9', text: 'What is your shipping accuracy rate (%)?', type: 'text', required: false, order: 9 },
      { id: 'shp_10', text: 'Do you offer same-day shipping?', type: 'boolean', required: false, order: 10 },
      { id: 'shp_11', text: 'What is your average shipping dock utilization %?', type: 'text', required: false, order: 11 },
      { id: 'shp_12', text: 'Do you use automated manifesting?', type: 'boolean', required: false, order: 12 }
    ]
  },
  {
    title: 'Returns & Reverse Logistics',
    order: 10,
    questions: [
      { id: 'ret_1', text: 'What is your current returns rate (%)?', type: 'text', required: true, order: 1 },
      { id: 'ret_2', text: 'Average number of returns per day', type: 'text', required: false, order: 2 },
      { id: 'ret_3', text: 'Do you have a dedicated returns area?', type: 'boolean', required: true, order: 3 },
      { id: 'ret_4', text: 'What is your average returns processing time (days)?', type: 'text', required: false, order: 4 },
      { id: 'ret_5', text: 'Do you perform quality inspection on returns?', type: 'boolean', required: true, order: 5 },
      { id: 'ret_6', text: 'What percentage of returns are restocked?', type: 'text', required: false, order: 6 },
      { id: 'ret_7', text: 'Do you have a returns management system?', type: 'boolean', required: false, order: 7 },
      { id: 'ret_8', text: 'What is the cost of returns processing?', type: 'text', required: false, order: 8 }
    ]
  },
  {
    title: 'Reporting & Analytics',
    order: 11,
    questions: [
      { id: 'rpt_1', text: 'Do you have real-time visibility into warehouse operations?', type: 'boolean', required: true, order: 1 },
      { id: 'rpt_2', text: 'What KPIs do you currently track?', type: 'text', required: true, order: 2 },
      { id: 'rpt_3', text: 'Do you have dashboards for warehouse performance?', type: 'boolean', required: false, order: 3 },
      { id: 'rpt_4', text: 'How often do you generate warehouse reports?', type: 'text', required: false, order: 4 },
      { id: 'rpt_5', text: 'Do you use BI (Business Intelligence) tools?', type: 'boolean', required: false, order: 5 },
      { id: 'rpt_6', text: 'Do you track labor productivity metrics?', type: 'boolean', required: true, order: 6 },
      { id: 'rpt_7', text: 'Do you have predictive analytics capabilities?', type: 'boolean', required: false, order: 7 },
      { id: 'rpt_8', text: 'Can you generate custom reports on demand?', type: 'boolean', required: false, order: 8 }
    ]
  },
  {
    title: 'Quality & Compliance',
    order: 12,
    questions: [
      { id: 'qc_1', text: 'Do you have quality control processes in place?', type: 'boolean', required: true, order: 1 },
      { id: 'qc_2', text: 'Are you subject to regulatory compliance (FDA, GMP, etc)?', type: 'boolean', required: false, order: 2 },
      { id: 'qc_3', text: 'Do you perform lot traceability?', type: 'boolean', required: false, order: 3 },
      { id: 'qc_4', text: 'Do you manage product recalls?', type: 'boolean', required: false, order: 4 },
      { id: 'qc_5', text: 'Do you track temperature-controlled inventory?', type: 'boolean', required: false, order: 5 },
      { id: 'qc_6', text: 'Do you have audit trail capabilities?', type: 'boolean', required: false, order: 6 },
      { id: 'qc_7', text: 'What is your quality defect rate (%)?', type: 'text', required: false, order: 7 }
    ]
  },
  {
    title: 'Operational Metrics',
    order: 13,
    questions: [
      { id: 'met_1', text: 'What is your average order fulfillment time (hours)?', type: 'text', required: false, order: 1 },
      { id: 'met_2', text: 'What is your perfect order rate (%)?', type: 'text', required: false, order: 2 },
      { id: 'met_3', text: 'What is your warehouse cost per order?', type: 'text', required: false, order: 3 },
      { id: 'met_4', text: 'What is your labor cost as % of total warehouse cost?', type: 'text', required: false, order: 4 },
      { id: 'met_5', text: 'What is your average dwell time (days)?', type: 'text', required: false, order: 5 },
      { id: 'met_6', text: 'What is your order fill rate (%)?', type: 'text', required: false, order: 6 },
      { id: 'met_7', text: 'What is your backorder rate (%)?', type: 'text', required: false, order: 7 },
      { id: 'met_8', text: 'What is your peak season volume increase (%)?', type: 'text', required: false, order: 8 },
      { id: 'met_9', text: 'What is your average order value?', type: 'text', required: false, order: 9 },
      { id: 'met_10', text: 'What is your order accuracy rate (%)?', type: 'text', required: false, order: 10 }
    ]
  },
  {
    title: 'Future Requirements & Growth',
    order: 14,
    questions: [
      { id: 'fut_1', text: 'What is your expected growth rate over next 3 years (%)?', type: 'text', required: false, order: 1 },
      { id: 'fut_2', text: 'Are you planning to add new warehouses/DCs?', type: 'boolean', required: false, order: 2 },
      { id: 'fut_3', text: 'Are you planning to expand into new markets/channels?', type: 'boolean', required: false, order: 3 },
      { id: 'fut_4', text: 'What new capabilities do you need in the next 2 years?', type: 'text', required: false, order: 4 },
      { id: 'fut_5', text: 'Are you planning to implement automation?', type: 'boolean', required: false, order: 5 },
      { id: 'fut_6', text: 'What is your expected SKU growth (%)?', type: 'text', required: false, order: 6 },
      { id: 'fut_7', text: 'Are you planning omnichannel fulfillment?', type: 'boolean', required: false, order: 7 }
    ]
  },
  {
    title: 'Value Expectations & ROI',
    order: 15,
    questions: [
      { id: 'val_1', text: 'What are your top 3 expected benefits from a new WMS?', type: 'text', required: true, order: 1 },
      { id: 'val_2', text: 'What is your expected ROI timeframe (months)?', type: 'text', required: false, order: 2 },
      { id: 'val_3', text: 'What operational improvements are you targeting (%)?', type: 'text', required: false, order: 3 },
      { id: 'val_4', text: 'What cost reductions are you expecting (%)?', type: 'text', required: false, order: 4 },
      { id: 'val_5', text: 'What accuracy improvements are you targeting (%)?', type: 'text', required: false, order: 5 },
      { id: 'val_6', text: 'What productivity improvements are you expecting (%)?', type: 'text', required: false, order: 6 },
      { id: 'val_7', text: 'What is your budget range for WMS implementation?', type: 'text', required: false, order: 7 },
      { id: 'val_8', text: 'What is your expected implementation timeline (months)?', type: 'text', required: false, order: 8 },
      { id: 'val_9', text: 'What are your must-have vs nice-to-have features?', type: 'text', required: false, order: 9 }
    ]
  },
  {
    title: 'Additional Information',
    order: 16,
    questions: [
      { id: 'add_1', text: 'What are your biggest concerns about implementing a new WMS?', type: 'text', required: false, order: 1 },
      { id: 'add_2', text: 'Do you have any specific industry requirements?', type: 'text', required: false, order: 2 },
      { id: 'add_3', text: 'What has been your experience with previous WMS implementations?', type: 'text', required: false, order: 3 },
      { id: 'add_4', text: 'What level of customization do you anticipate needing?', type: 'text', required: false, order: 4 },
      { id: 'add_5', text: 'Do you have internal IT resources for implementation support?', type: 'boolean', required: false, order: 5 },
      { id: 'add_6', text: 'Any additional comments or requirements?', type: 'text', required: false, order: 6 }
    ]
  }
];

const comprehensiveQuestionnaire = {
  title: 'Infor WMS Questionnaire',
  description: 'Comprehensive WMS discovery and requirements assessment',
  version: '2.0',
  isActive: true,
  sections: sections
};

async function seedQuestionnaire() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    await Questionnaire.deleteMany({ title: 'Infor WMS Questionnaire' });
    const q = await Questionnaire.create(comprehensiveQuestionnaire);
    console.log('Created questionnaire with', q.sections.length, 'sections');
    let total = 0;
    q.sections.forEach(s => { total += s.questions.length; });
    console.log('Total questions:', total);
    await mongoose.disconnect();
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedQuestionnaire();
