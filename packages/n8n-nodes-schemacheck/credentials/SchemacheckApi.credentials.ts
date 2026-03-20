import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class SchemacheckApi implements ICredentialType {
  name = 'schemacheckApi';
  displayName = 'SchemaCheck API';
  documentationUrl = 'https://www.schemacheck.dev/docs/authentication';
  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
    },
  ];
}
