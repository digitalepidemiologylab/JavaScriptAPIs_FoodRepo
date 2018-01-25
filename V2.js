/*

This is just a draft of what a JavaScript consumption of
FoodRepo's API could be

@flow

*/

/*
HELPERS
*/

// Gets a value or a list of values and a name, and returns a string in the form
// name=value1&name=value2=name=value3

function arrayToQuery(values, name: string) {
  if (
    typeof values === 'undefined' ||
    values === null ||
    typeof name !== 'string'
  ) {
    return null;
  }
  const valuesArray = Array.isArray(values) ? values : [values];
  return valuesArray.map(value => `${name}=${value}`).join('&');
}

// AJAX helper
function reachUrl(
  method: string,
  url: string,
  headers: string[][],
  data,
  callback: Function,
) {
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function onreadystatechange() {
    if (this.readyState === 4) {
      if (typeof callback === 'function') {
        callback(this);
      }
    }
  };

  // Open connection
  xhttp.open(method, url, true);

  // Prepare POST data, if any
  const isPostWithData = method === 'POST' && data;
  let dataStr;
  if (isPostWithData) {
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    dataStr = typeof data === 'string' ? data : JSON.stringify(data);
  }

  // Put headers
  if (Array.isArray(headers)) {
    headers.forEach((header) => {
      if (Array.isArray(header) && header.length === 2) {
        xhttp.setRequestHeader(header[0], header[1]);
      }
    });
  }

  // Send request
  xhttp.send(isPostWithData ? dataStr : null);
}

// Make a call to the endpoint and handle the response
function requestURL(method, endpoint, kind, query, postData, callback) {
  if (!callback) throw new Error('Callback is needed');
  const queryStr = query ? `?${query.join('&')}` : '';
  const url = `${endpoint.host}/api/v${endpoint.version}/${kind}${queryStr}`;

  // Authorization token is sent in the request header
  // Example: Authorization: Token token='582736451287365'
  const headers = [['Authorization', `Token token="${endpoint.apiKey}"`]];

  function handler(ajax) {
    let response;
    try {
      response = JSON.parse(ajax.responseText);
      const createReachUrlCall = function createReachUrlCall(name) {
        return function reachUrlCall() {
          reachUrl(
            method,
            unescape(response.links[name]),
            headers,
            postData,
            handler,
          );
        };
      };
      response.next = createReachUrlCall('next');
      response.prev = createReachUrlCall('prev');
      response.first = createReachUrlCall('first');
      response.last = createReachUrlCall('last');
    } catch (error) {
      response = ajax.responseText;
    }
    callback(response);
  }

  reachUrl(method, url, headers, postData, handler);
}

function requestPostURL(endpoint, kind, postData, callback) {
  requestURL('POST', endpoint, kind, null, postData, callback);
}

function requestProductURL(
  endpoint,
  id,
  includes,
  pageNumber,
  pageSize,
  callback,
) {
  const query = [];
  const includesQuery = arrayToQuery(includes, 'include');
  if (includesQuery) query.push(includesQuery);
  if (pageNumber) query.push(`page[number]=${pageNumber}`);
  if (pageSize) query.push(`page[size]=${pageSize}`);

  let kind = 'products';
  if (id) kind += '/';

  requestURL('GET', endpoint, kind, query, null, callback);
}

function requestSearchURL(endpoint, terms, callback) {
  requestPostURL(endpoint, 'products/_search', terms, callback);
}

export default class FoodRepoAPI {
  host: string;
  version: string;
  apiKey: string;

  static revision = 'ALPHA';
  static IMAGES = 'images';
  static NUTRIENTS = 'nutrients';

  /*
  FoodRepo API per se
  */
  constructor(apiKey: string, host: string = '', version: string = '2') {
    if (!apiKey) {
      throw new Error('FoodRepo endpoints need an API key');
    }
    // this.host = host || 'https://foodrepo-staging.herokuapp.com';
    this.host = host || 'https://www.foodrepo.ch';
    this.version = version;
    this.apiKey = apiKey;
  }

  product(id: string, includes: string[], callback: Function) {
    requestProductURL(this, id, includes, null, null, (response) => {
      callback(response);
    });
  }

  products(pageNumber: number, pageSize: number, callback: Function) {
    requestProductURL(this, null, null, pageNumber, pageSize, (response) => {
      callback(response);
    });
  }

  productsSearch(terms: string, callback: Function) {
    const data = {
      query: {
        terms,
      },
    };

    requestSearchURL(this, data, (response) => {
      callback(response);
    });
  }
}
