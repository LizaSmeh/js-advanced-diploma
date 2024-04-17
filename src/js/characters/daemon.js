import Character from '../Character.js';

export default class Daemon extends Character {
  constructor(level) {
    super(level, 'Daemon');
    this.attack = 10;
    this.defence = 10;
    this.distance = 1;
    this.attackRange = 4;
  }
}
