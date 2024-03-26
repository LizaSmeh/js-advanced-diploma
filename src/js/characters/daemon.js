import Character from '../Character.js';

export default class Daemon extends Character {
  constructor(level, type = 'Daemon') {
    super(level, type);
    this.attack = 10;
    this.defence = 10;
  }
}
