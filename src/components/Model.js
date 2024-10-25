import * as tmImage from "@teachablemachine/image";

export default class Model {
  constructor(model, canvas) {
    this.model = model;
    this.getPredictions(canvas);
  }

  getModel() {
    return this.model;
  }

  async getPredictions(canvas) {
    if (typeof this.model.predict === "function") {
      let predictions = await this.model.predict(canvas);
      return predictions;
    }
    return null;
  }
}
