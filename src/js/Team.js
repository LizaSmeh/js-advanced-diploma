/**
 * Класс, представляющий персонажей команды
 *
 * @todo Самостоятельно продумайте хранение персонажей в классе
 * Например
 * @example
 * ```js
 * const characters = [new Swordsman(2), new Bowman(1)]
 * const team = new Team(characters);
 *
 * team.characters // [swordsman, bowman]
 * ```
 * */
export default class Team {
  // TODO: write your logic here
  constructor() {
    this.characters = new Set();
  }

  add(character) {
    this.characters.add(character);
  }

  addAll(...characters) {
    characters.forEach((item) => this.characters.add(item));
  }

  toArray() {
    this.characters = Array.from(this.characters);
  }
}
