

import { Card } from './card';
export class CardResponse {

  cards: Array<Card>;
  nextPage: string;




  constructor(cards: Array<Card>, nextPage: string) {
    this.cards = cards;
    this.nextPage = nextPage;
  }
}
