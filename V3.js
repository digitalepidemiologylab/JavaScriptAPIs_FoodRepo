/* @flow */

/*

This is just a draft of what a JavaScript consumption of
FoodRepo's API could be

*/

import GenericAPI from 'salathegroup_apis_common';

type TProductParams = {
  id?: number,
  excludes?: Array<string>,
  barcodes?: Array<string>,
  pageNumber?: number,
  pageSize?: number,
};

type TSubmissionReportParams = {
  barcodes: string[],
  excludes?: Array<string>,
  activeOnly?: boolean,
};

export default class FoodRepoAPI extends GenericAPI {
  static defaultHost = 'https://www.foodrepo.org';

  static revision = 'ALPHA';

  static ALL_PRODUCT_FIELDS = [
    'id',
    'barcode',
    'display_name_translations',
    'origin_translations',
    'name_translations',
    'ingredients_translations',
    'nutrients',
    'status',
    'quantity',
    'unit',
    'portion_quantity',
    'portion_unit',
    'alcohol_by_volume',
    'images',
    'created_at',
    'updated_at',
  ];

  constructor(apiKey: string, host: string = '', version: string = '3') {
    super(apiKey, host || FoodRepoAPI.defaultHost, version);
  }

  submissionReport(params: TSubmissionReportParams): Promise<Object[]> {
    const query = [];

    const { barcodes, excludes, activeOnly } = params;
    query.push(`barcodes=${barcodes.join(',')}`);
    if (excludes) query.push(`excludes=${excludes.join(',')}`);
    query.push(`active-only=${activeOnly ? 'true' : 'false'}`);
    return new Promise((resolve, reject) => {
      this.requestURL(
        'GET',
        'submission_report',
        query,
      )
      .then(
        (response) => {
          if (response
            && response.data
            && Array.isArray(response.data.submissions)) {
            resolve(response.data.submissions);
          } else {
            reject(new Error('Couldn\'t get submission report'));
          }
        }
      )
      .catch(reject);
    });
  }

  requestSearchURL(terms: Object): Promise<Object> {
    return this.requestPostURL('products/_search', terms);
  }

  requestProductURL(params: TProductParams): Promise<Object[]> {
    const query = [];

    const {
      barcodes, excludes, pageNumber, pageSize,
    } = params;

    if (excludes) query.push(`excludes=${excludes.join(',')}`);
    if (barcodes) query.push(`barcodes=${barcodes.join(',')}`);
    if (pageNumber) query.push(`page[number]=${pageNumber}`);
    if (pageSize) query.push(`page[size]=${pageSize}`);

    return new Promise((resolve, reject) => {
      this.requestURL(
        'GET',
        `products${params.id ? `/${params.id}` : ''}`,
        query,
      ).then(
        (response) => {
          if (response && response.data && Array.isArray(response.data)) {
            resolve(response.data);
          } else {
            reject(new Error('Couldn\'t get products'));
          }
        },
        reject,
      );
    });
  }

  productsByBarcodes(
    barcodes: string[],
    excludes: string[],
  ): Promise<Object[]> {
    return this.requestProductURL({ excludes, barcodes });
  }

  productById(id: number, excludes: string[]): Promise<Object[]> {
    return this.requestProductURL({ id, excludes });
  }

  products(
    pageNumber: number,
    pageSize: number,
    excludes: string[],
  ): Promise<Object[]> {
    return this.requestProductURL({ pageNumber, pageSize, excludes });
  }

  productsSearch(query: Object): Promise<Object> {
    return this.requestSearchURL({ query });
  }
}
