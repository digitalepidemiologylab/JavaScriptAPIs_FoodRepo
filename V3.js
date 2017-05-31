/* @flow */

/*

This is just a draft of what a JavaScript consumption of
OpenFood's API could be

*/

import GenericAPI from '../../SalatheGroupAPI/GenericAPI';

export default class OpenFoodAPI extends GenericAPI {

  static defaultHost = 'https://www.openfood.ch';
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
    super(apiKey, host || OpenFoodAPI.defaultHost, version);
  }

  requestSearchURL(terms: Object): Promise<Object> {
    return this.requestPostURL('products/_search', terms);
  }

  requestProductURL(params: Object): Promise<Object[]> {
    const query = [];

    if (params.excludes) query.push(`excludes=${params.excludes.join(',')}`);
    if (params.barcodes) query.push(`barcodes=${params.barcodes.join(',')}`);
    if (params.pageNumber) query.push(`page[number]=${params.pageNumber}`);
    if (params.pageSize) query.push(`page[size]=${params.pageSize}`);

    let kind = 'products';
    if (params.id) kind += '/';
    return new Promise((resolve, reject) => {
      this.requestURL('GET', kind, query, {})
      .then((response) => {
        if (response && response.data && Array.isArray(response.data)) {
          resolve(response.data);
        } else {
          reject(new Error('Couldn\'t get products'));
        }
      }, (error) => {
        reject(error);
      });
    });
  }

  productsByBarcodes(barcodes: string[], excludes: string[]): Promise<Object[]> {
    return this.requestProductURL({ excludes, barcodes });
  }

  productById(id: string, excludes: string[]): Promise<Object[]> {
    return this.requestProductURL({ id, excludes });
  }

  products(pageNumber: number, pageSize: number, excludes: string[]): Promise<Object[]> {
    return this.requestProductURL({ pageNumber, pageSize, excludes });
  }

  productsSearch(query: Object): Promise<Object> {
    return this.requestSearchURL({ query });
  }
}
