/* @flow */

/*

This is just a draft of what a JavaScript consumption of
FoodRepo's API could be

*/

import GenericAPI from 'salathegroup_apis_common';

function addImageToData(image, idx, data) {
  if (idx === 0) {
    data.append(`submission[submission_images_attributes][${idx}][front]`, 'true');
  }
  const re = /^data:(.*\/.*?),/;
  const matches = image.match(re);
  let type;
  if (matches) {
    [, type] = matches;
  } else {
    type = 'image/jpeg';
  }
  data.append(`submission[submission_images_attributes][${idx}][data]`, {
    name: `${idx}.jpg`,
    type,
    uri: image,
  });
}

export default class FoodRepoAPI extends GenericAPI {
  static defaultHost = 'https://www.foodrepo.org';

  static revision = 'ALPHA';

  constructor(host: string = '', version: string = '1') {
    super(
      '_',
      host || FoodRepoAPI.defaultHost,
      version,
      'auto',
      'multipart/form-data'
    );
  }

  postSubmission(barcode: string, country: string, images: string[]) {
    if (!barcode || !country || !images) {
      throw new Error('Invalid arguments in postSubmission');
    }
    const data = new FormData();
    data.append('submission[barcode]', barcode);
    data.append('submission[country]', country);
    images.forEach((image, idx) => { addImageToData(image, idx, data); });
    return this.requestPostURL('submissions', data);

    /*
    const formData = new FormData();
    formData.append('submission[barcode]', '1234567890123');
    formData.append('submission[country]', 'ch');
    formData.append(
      'submission[submission_images_attributes][1550225435540][front]',
      'true',
    );
    formData.append(
      'submission[submission_images_attributes][1550225435540][data]',
      {
        name: '1550241293688.jpg',
        type: 'image/jpeg; base64',
        uri: url,
      },
    );
    fetch(this.host + '/api/v1/submissions', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        // 'Content-Type': 'multipart/form-data',
      },
      body: formData,
    })
    // .then(response => response.json())
    // .then(responseJson => responseJson.movies)
    .catch((error) => {
      alert(error);
    });

    const xhttp = new XMLHttpRequest();
    xhttp.open('POST', this.host + '/api/v1/submissions', true);
    xhttp.setRequestHeader('Accept', 'application/json');
    xhttp.setRequestHeader('Content-Type', 'multipart/form-data');
    xhttp.send(formData);

    reachUrl(
      'POST',
      this.host + '/api/v1/submissions',
      [['Accept', 'application/json'], ['Content-Type', 'multipart/form-data']],
      {
        submission: {
          barcode: '1234123412340',
          country: 'de',
          submission_images_attributes: {
            1550241293688: {
              front: 'true',
              data: {
                _keepAsObject: true,
                name: '1550241293688.jpg',
                type: 'image/jpeg; base64',
                uri: url,
              },
            },
          },
        },
      },
      () => {},
      () => {},
      0,
      ''
    );

    reachUrl(
      'POST',
      this.host + '/api/v1/submissions',
      [],
      formData,
      () => {}
    );
*/
  }
}
