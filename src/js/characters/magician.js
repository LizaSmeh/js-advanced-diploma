import Character from '../Character.js';

export default class Magician extends Character {
  constructor(level) {
    super(level, 'Magician');
    this.attack = 10;
    this.defence = 40;
    this.distance = 1;
    this.attackRange = 4;
  }
}
