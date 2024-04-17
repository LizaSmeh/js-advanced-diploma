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
    this.members = new Set();
  }

  add(character) {
    if (this.members.has(character)) {
      throw new Error(`Персонаж ${character.name} уже в команде`);
    }
    this.members.add(character);
  }

  addAll(...arrCharacter) {
    arrCharacter.forEach((item) => this.members.add(item));
  }

  delete(el) {
    this.members.delete(el);
  }

  toArray() {
    return Array.from(this.members);
  }

  // symbol
}
