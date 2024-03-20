import Character from '../Character/character.js';

export default class Zombie extends Character {
  constructor(name, type = 'Zombie') {
    super(name, type);
    this.attack = 10;
    this.defence = 40;
  }
}
