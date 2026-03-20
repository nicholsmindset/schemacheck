import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

const BASE_URL = 'https://www.schemacheck.dev';

export class Schemacheck implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'SchemaCheck',
    name: 'schemacheck',
    icon: 'file:schemacheck.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Validate schema markup and manage monitors with SchemaCheck',
    defaults: {
      name: 'SchemaCheck',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'schemacheckApi',
        required: true,
      },
    ],
    properties: [
      // ── Operation selector ────────────────────────────────────────────────
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Validate URL',
            value: 'validateUrl',
            description: 'Validate schema markup on a live URL',
            action: 'Validate schema markup on a URL',
          },
          {
            name: 'Validate JSON-LD',
            value: 'validateJsonld',
            description: 'Validate a raw JSON-LD object directly',
            action: 'Validate a raw JSON-LD object',
          },
          {
            name: 'Batch Validate',
            value: 'batchValidate',
            description: 'Validate schema markup on multiple URLs at once',
            action: 'Batch validate multiple URLs',
          },
          {
            name: 'List Monitors',
            value: 'listMonitors',
            description: 'Retrieve all active schema monitors',
            action: 'List all monitors',
          },
          {
            name: 'Create Monitor',
            value: 'createMonitor',
            description: 'Create a new recurring schema monitor for a URL',
            action: 'Create a monitor',
          },
          {
            name: 'Delete Monitor',
            value: 'deleteMonitor',
            description: 'Delete a schema monitor by ID',
            action: 'Delete a monitor',
          },
        ],
        default: 'validateUrl',
      },

      // ── Validate URL fields ───────────────────────────────────────────────
      {
        displayName: 'URL',
        name: 'url',
        type: 'string',
        required: true,
        default: '',
        placeholder: 'https://example.com/blog/my-post',
        description: 'The page URL to validate',
        displayOptions: {
          show: {
            operation: ['validateUrl'],
          },
        },
      },

      // ── Validate JSON-LD fields ───────────────────────────────────────────
      {
        displayName: 'JSON-LD',
        name: 'jsonld',
        type: 'json',
        required: true,
        default: '{\n  "@context": "https://schema.org",\n  "@type": "Article",\n  "headline": "My Article"\n}',
        description: 'The raw JSON-LD object to validate',
        displayOptions: {
          show: {
            operation: ['validateJsonld'],
          },
        },
      },

      // ── Batch Validate fields ─────────────────────────────────────────────
      {
        displayName: 'URLs',
        name: 'urls',
        type: 'string',
        required: true,
        default: '',
        placeholder: 'https://example.com/page-1, https://example.com/page-2',
        description: 'Comma-separated list of URLs to validate',
        displayOptions: {
          show: {
            operation: ['batchValidate'],
          },
        },
      },

      // ── Create Monitor fields ─────────────────────────────────────────────
      {
        displayName: 'URL',
        name: 'monitorUrl',
        type: 'string',
        required: true,
        default: '',
        placeholder: 'https://example.com/blog/my-post',
        description: 'The page URL to monitor',
        displayOptions: {
          show: {
            operation: ['createMonitor'],
          },
        },
      },
      {
        displayName: 'Check Frequency',
        name: 'frequency',
        type: 'options',
        options: [
          { name: 'Daily', value: 'daily' },
          { name: 'Weekly', value: 'weekly' },
          { name: 'Monthly', value: 'monthly' },
        ],
        default: 'weekly',
        description: 'How often to run the schema check',
        displayOptions: {
          show: {
            operation: ['createMonitor'],
          },
        },
      },

      // ── Delete Monitor fields ─────────────────────────────────────────────
      {
        displayName: 'Monitor ID',
        name: 'monitorId',
        type: 'string',
        required: true,
        default: '',
        description: 'The ID of the monitor to delete',
        displayOptions: {
          show: {
            operation: ['deleteMonitor'],
          },
        },
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    const credentials = await this.getCredentials('schemacheckApi');
    const apiKey = credentials.apiKey as string;

    for (let i = 0; i < items.length; i++) {
      const operation = this.getNodeParameter('operation', i) as string;

      try {
        let responseData: IDataObject;

        if (operation === 'validateUrl') {
          const url = this.getNodeParameter('url', i) as string;
          const response = await this.helpers.request({
            method: 'GET',
            url: `${BASE_URL}/api/v1/validate`,
            qs: { url },
            headers: { 'x-api-key': apiKey },
            json: true,
          });
          responseData = response as IDataObject;

        } else if (operation === 'validateJsonld') {
          const jsonldRaw = this.getNodeParameter('jsonld', i) as string;
          const jsonld =
            typeof jsonldRaw === 'string' ? JSON.parse(jsonldRaw) : jsonldRaw;

          const response = await this.helpers.request({
            method: 'POST',
            url: `${BASE_URL}/api/v1/validate`,
            headers: {
              'x-api-key': apiKey,
              'Content-Type': 'application/json',
            },
            body: { jsonld },
            json: true,
          });
          responseData = response as IDataObject;

        } else if (operation === 'batchValidate') {
          const urlsRaw = this.getNodeParameter('urls', i) as string;
          const urls = urlsRaw
            .split(',')
            .map((u) => u.trim())
            .filter(Boolean);

          const response = await this.helpers.request({
            method: 'POST',
            url: `${BASE_URL}/api/v1/validate/batch`,
            headers: {
              'x-api-key': apiKey,
              'Content-Type': 'application/json',
            },
            body: { urls },
            json: true,
          });
          responseData = response as IDataObject;

        } else if (operation === 'listMonitors') {
          const response = await this.helpers.request({
            method: 'GET',
            url: `${BASE_URL}/api/v1/monitors`,
            headers: { 'x-api-key': apiKey },
            json: true,
          });
          responseData = response as IDataObject;

        } else if (operation === 'createMonitor') {
          const monitorUrl = this.getNodeParameter('monitorUrl', i) as string;
          const frequency = this.getNodeParameter('frequency', i) as string;

          const response = await this.helpers.request({
            method: 'POST',
            url: `${BASE_URL}/api/v1/monitors`,
            headers: {
              'x-api-key': apiKey,
              'Content-Type': 'application/json',
            },
            body: { url: monitorUrl, frequency },
            json: true,
          });
          responseData = response as IDataObject;

        } else if (operation === 'deleteMonitor') {
          const monitorId = this.getNodeParameter('monitorId', i) as string;

          const response = await this.helpers.request({
            method: 'DELETE',
            url: `${BASE_URL}/api/v1/monitors/${monitorId}`,
            headers: { 'x-api-key': apiKey },
            json: true,
          });
          responseData = response as IDataObject;

        } else {
          throw new NodeOperationError(
            this.getNode(),
            `Unknown operation: ${operation}`,
            { itemIndex: i },
          );
        }

        returnData.push({
          json: responseData,
          pairedItem: { item: i },
        });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: (error as Error).message,
            },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
