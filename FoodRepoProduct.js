// @flow

export default class FoodRepoProduct {
  constructor(json) {
    this.json = json || {};
  }

  getImages(): Array<Object> {
    return this.json.images;
  }

  getImageUrls(type): Array<string> {
    const images = this.getImages();
    return images ? images.map(i => i[type]) : null;
  }

  getDisplayName(lang): string {
    const displayNameTranslations = this.json.display_name_translations;
    return displayNameTranslations ? displayNameTranslations[lang] : null;
  }

  getBarcode(): string {
    return this.json.barcode;
  }
}
