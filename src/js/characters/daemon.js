import Character from '../Character/character.js';

export default class Daemon extends Character {
  constructor(name, type = 'Daemon') {
    super(name, type);
    this.attack = 25;
    this.defence = 25;
  }
}
