const typeClass = ['Bowman', 'Swordsman', 'Magician', 'Daemon', 'Undead', 'Zombie'];

export default class Character {
  constructor(name, type) {
    if (name.length < 2 || name.length > 10) {
      throw new Error('Ошибка! Имя должно содержать от 2 до 10 символов.');
    }

    if (!(typeClass.includes(type))) {
      throw new Error('Данного класса не существует.');
    }

    this.name = name;
    this.type = type;
    this.health = 100;
    this.level = 1;
    this.attack = undefined;
    this.defence = undefined;
  }
}
