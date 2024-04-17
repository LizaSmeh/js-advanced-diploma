import GamePlay from './GamePlay.js';
import themes from './themes.js';
import PositionedCharacter from './PositionedCharacter.js';
import GameState from './GameState.js';
import { generateTeam } from './generators.js';
import Team from './Team.js';
import cursors from './cursors.js';
import Bowman from './characters/bowman.js';
import Swordsman from './characters/swordsman.js';
import Magician from './characters/magician.js';
import Vampire from './characters/vampire.js';
import Daemon from './characters/daemon.js';
import Undead from './characters/undead.js';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.userTeam = new Team();
    this.enemyTeam = new Team();
    this.userCharacters = [Bowman, Swordsman, Magician];
    this.enemyCharacters = [Daemon, Undead, Vampire];
    this.gameState = new GameState();
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.gamePlay.drawUi(themes[this.gameState.level]);

    this.userTeam.addAll(generateTeam([Bowman, Swordsman], 1, 2));
    this.enemyTeam.addAll(generateTeam(this.enemyCharacters, 1, 2));

    this.addTeamPosition(this.userTeam, this.getUserStartPositions());
    this.addTeamPosition(this.enemyTeam, this.getEnemyStartPositions());

    this.gamePlay.redrawPositions(this.gameState.allPositions);

    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));

    this.gamePlay.addNewGameListener(this.onNewGameClick.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGameClick.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGameClick.bind(this));
  }

  onCellClick(index) {
    if (this.gameState.level === 5 || this.userTeam.members.size === 0) {
      return;
    }
    if (this.gameState.selected !== null
      && this.getCharacter(index) && this.isEnemyCharacter(index)) {
      if (this.isAttack(index)) {
        this.getAttack(index, this.gameState.selected);
      }
    }
    if (this.gameState.selected !== null && this.isMoving(index) && !this.getCharacter(index)) {
      if (this.gameState.isUsersTurn) {
        this.getUserTurn(index);
      }
    }
    if (this.gameState.selected !== null && !this.isMoving(index) && !this.isAttack(index)) {
      if (this.gameState.isUsersTurn && !this.getCharacter(index)) {
        GamePlay.showError('Недопустимый ход!');
      }
    }
    if (this.getCharacter(index) && this.isEnemyCharacter(index) && !this.isAttack(index)) {
      GamePlay.showError('Это не ваш персонаж!');
    }
    if (this.getCharacter(index) && this.isUserCharacter(index)) {
      this.gamePlay.cells.forEach((element) => element.classList.remove('selected-green'));
      this.gamePlay.cells.forEach((element) => element.classList.remove('selected-yellow'));
      this.gamePlay.selectCell(index);
      this.gameState.selected = index;
    }
  }

  onCellEnter(index) {
    if (this.getCharacter(index) && this.isUserCharacter(index)) {
      this.gamePlay.setCursor(cursors.pointer);
    }
    if (this.gameState.selected !== null && !this.getCharacter(index) && this.isMoving(index)) {
      this.gamePlay.setCursor(cursors.pointer);
      this.gamePlay.selectCell(index, 'green');
    }
    if (this.getCharacter(index)) {
      const char = this.getCharacter(index).character;
      const message = `\u{1F396}${char.level}\u{2694}${char.attack}\u{1F6E1}${char.defence}\u{2764}${char.health}`;
      this.gamePlay.showCellTooltip(message, index);
    }
    if (this.gameState.selected !== null && this.getCharacter(index)
    && !this.isUserCharacter(index)) {
      if (this.isAttack(index)) {
        this.gamePlay.setCursor(cursors.crosshair);
        this.gamePlay.selectCell(index, 'red');
      }
    }
    if (this.gameState.selected !== null && !this.isAttack(index) && !this.isMoving(index)) {
      if (!this.isUserCharacter(index)) {
        this.gamePlay.setCursor(cursors.notallowed);
      }
    }
  }

  onCellLeave(index) {
    this.gamePlay.cells.forEach((element) => element.classList.remove('selected-red'));
    this.gamePlay.cells.forEach((element) => element.classList.remove('selected-green'));
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.auto);
  }

  getCharacter(index) {
    return this.gameState.allPositions.find((element) => element.position === index);
  }

  getDelete(index) {
    const state = this.gameState.allPositions;
    state.splice(state.indexOf(this.getCharacter(index)), 1);
  }

  getScoringPoints() {
    this.gameState.points += this.userTeam.toArray().reduce((a, b) => a + b.health, 0);
  }

  getResult() {
    if (this.userTeam.members.size === 0) {
      this.gameState.statistics.push(this.gameState.points);
      GamePlay.showMessage(`Вы проиграли:( Количество очков: ${this.gameState.points}.`);
    }
    if (this.enemyTeam.members.size === 0 && this.gameState.level === 4) {
      this.getScoringPoints();
      this.gameState.statistics.push(this.gameState.points);
      GamePlay.showMessage(`Вы победили! Поздравляем! Количество очков: ${this.gameState.points}, 
      Максимальное количество очков: ${Math.max(...this.gameState.statistics)}`);
      this.gameState.level += 1;
    }
    if (this.enemyTeam.members.size === 0 && this.gameState.level <= 3) {
      this.gameState.isUsersTurn = true;
      this.getScoringPoints();
      GamePlay.showMessage(`Вы прошли уровень ${this.gameState.level}. Количество очков: ${this.gameState.points}.`);
      this.gameState.level += 1;
      this.getLevelUp();
    }
  }

  getEnemyResponse() {
    if (this.gameState.isUsersTurn) {
      return;
    }
    const enemysTeam = this.gameState.allPositions.filter((element) => (
      element.character instanceof Vampire
      || element.character instanceof Daemon
      || element.character instanceof Undead
    ));
    const usersTeam = this.gameState.allPositions.filter((element) => (
      element.character instanceof Bowman
      || element.character instanceof Swordsman
      || element.character instanceof Magician
    ));
    let bot = null;
    let target = null;

    if (enemysTeam.length === 0 || usersTeam.length === 0) {
      return;
    }

    enemysTeam.forEach((el) => {
      const rangeAttack = this.calcRange(el.position, el.character.attackRange);
      usersTeam.forEach((element) => {
        if (rangeAttack.includes(element.position)) {
          bot = el;
          target = element;
        }
      });
    });

    if (target) {
      const damage = Math.max(bot.character.attack - target.character.defence, bot.character.attack * 0.1);
      this.gamePlay.showDamage(target.position, damage).then(() => {
        target.character.health -= damage;
        if (target.character.health <= 0) {
          this.getDelete(target.position);
          this.userTeam.delete(target.character);
          this.gamePlay.deselectCell(this.gameState.selected);
          this.gameState.selected = null;
        }
      }).then(() => {
        this.gamePlay.redrawPositions(this.gameState.allPositions);
        this.gameState.isUsersTurn = true;
      }).then(() => {
        this.getResult();
      });
    } else {
      bot = enemysTeam[Math.floor(Math.random() * enemysTeam.length)];
      const botRange = this.calcRange(bot.position, bot.character.distance);
      botRange.forEach((element) => {
        this.gameState.allPositions.forEach((i) => {
          if (element === i.position) {
            botRange.splice(botRange.indexOf(i.position), 1);
          }
        });
      });
      const botPos = this.getRandom(botRange);
      bot.position = botPos;

      this.gamePlay.redrawPositions(this.gameState.allPositions);
      this.gameState.isUsersTurn = true;
    }
  }

  getAttack(index) {
    if (this.gameState.isUsersTurn) {
      const attacker = this.getCharacter(this.gameState.selected).character;
      const target = this.getCharacter(index).character;
      const damage = Math.max(attacker.attack - target.defence, attacker.attack * 0.1);
      if (!attacker || !target) {
        return;
      }
      this.gamePlay.showDamage(index, damage).then(() => {
        target.health -= damage;
        if (target.health <= 0) {
          this.getDelete(index);
          this.enemyTeam.delete(target);
        }
      }).then(() => {
        this.gamePlay.redrawPositions(this.gameState.allPositions);
      }).then(() => {
        this.getResult();
        this.getEnemyResponse();
      });
      this.gameState.isUsersTurn = false;
    }
  }

  getUserTurn(index) {
    this.getSelectedCharacter().position = index;
    this.gamePlay.deselectCell(this.gameState.selected);
    this.gamePlay.redrawPositions(this.gameState.allPositions);
    this.gameState.selected = index;
    this.gameState.isUsersTurn = false;
    this.getEnemyResponse();
  }

  getLevelUp() {
    this.gameState.allPositions = [];
    this.userTeam.members.forEach((element) => element.levelUp());

    if (this.gameState.level === 2) {
      this.userTeam.addAll(generateTeam(this.userCharacters, 1, 1));
      this.enemyTeam.addAll(generateTeam(this.enemyCharacters, 2, this.userTeam.members.size));
    }
    if (this.gameState.level === 3) {
      this.userTeam.addAll(generateTeam(this.userCharacters, 2, 2));
      this.enemyTeam.addAll(generateTeam(this.enemyCharacters, 3, this.userTeam.members.size));
    }
    if (this.gameState.level === 4) {
      this.userTeam.addAll(generateTeam(this.userCharacters, 3, 2));
      this.enemyTeam.addAll(generateTeam(this.enemyCharacters, 4, this.userTeam.members.size));
    }

    GamePlay.showMessage(`Уровень: ${this.gameState.level}`);
    this.gamePlay.drawUi(themes[this.gameState.level]);
    this.addTeamPosition(this.userTeam, this.getUserStartPositions());
    this.addTeamPosition(this.enemyTeam, this.getEnemyStartPositions());
    this.gamePlay.redrawPositions(this.gameState.allPositions);
  }

  isMoving(index) {
    if (this.getSelectedCharacter()) {
      const mov = this.getSelectedCharacter().character.distance;
      const arr = this.calcRange(this.gameState.selected, mov);
      return arr.includes(index);
    }
    return false;
  }

  isAttack(index) {
    if (this.getSelectedCharacter()) {
      const stroke = this.getSelectedCharacter().character.attackRange;
      const arr = this.calcRange(this.gameState.selected, stroke);
      return arr.includes(index);
    }
    return false;
  }

  getUserStartPositions() {
    const size = this.gamePlay.boardSize;
    this.userPosition = [];
    for (let i = 0, j = 1; this.userPosition.length < size * 2; i += size, j += size) {
      this.userPosition.push(i, j);
    }
    return this.userPosition;
  }

  getEnemyStartPositions() {
    const size = this.gamePlay.boardSize;
    const enemyPosition = [];
    for (let i = size - 2, j = size - 1; enemyPosition.length < size * 2; i += size, j += size) {
      enemyPosition.push(i, j);
    }
    return enemyPosition;
  }

  getRandom(positions) {
    this.positions = positions;
    return this.positions[Math.floor(Math.random() * this.positions.length)];
  }

  addTeamPosition(team, positions) {
    const copyPositions = [...positions];
    for (const item of team) {
      const random = this.getRandom(copyPositions);
      this.gameState.allPositions.push(new PositionedCharacter(item, random));
      copyPositions.splice(copyPositions.indexOf(random), 1);
    }
  }

  isUserCharacter(index) {
    if (this.getCharacter(index)) {
      const char = this.getCharacter(index).character;
      return this.userCharacters.some((element) => char instanceof element);
    }
    return false;
  }

  isEnemyCharacter(index) {
    if (this.getCharacter(index)) {
      const en = this.getCharacter(index).character;
      return this.enemyCharacters.some((element) => en instanceof element);
    }
    return false;
  }

  calcRange(index, character) {
    const brdSize = this.gamePlay.boardSize;
    const range = [];
    const leftBorder = [];
    const rightBorder = [];

    for (let i = 0, j = brdSize - 1; leftBorder.length < brdSize; i += brdSize, j += brdSize) {
      leftBorder.push(i);
      rightBorder.push(j);
    }

    for (let i = 1; i <= character; i += 1) {
      range.push(index + (brdSize * i));
      range.push(index - (brdSize * i));
    }

    for (let i = 1; i <= character; i += 1) {
      if (leftBorder.includes(index)) {
        break;
      }
      range.push(index - i);
      range.push(index - (brdSize * i + i));
      range.push(index + (brdSize * i - i));
      if (leftBorder.includes(index - i)) {
        break;
      }
    }

    for (let i = 1; i <= character; i += 1) {
      if (rightBorder.includes(index)) {
        break;
      }
      range.push(index + i);
      range.push(index - (brdSize * i - i));
      range.push(index + (brdSize * i + i));
      if (rightBorder.includes(index + i)) {
        break;
      }
    }
    return range.filter((element) => element >= 0 && element <= (brdSize ** 2 - 1));
  }

  onNewGameClick() {
    this.userTeam = new Team();
    this.enemyTeam = new Team();
    this.enemyCharacters = [Daemon, Undead, Vampire];
    this.userCharacters = [Bowman, Swordsman, Magician];
    this.gameState.selected = null;
    this.gameState.level = 1;
    this.gameState.points = 0;
    this.gameState.allPositions = [];
    this.gameState.isUsersTurn = true;

    this.gamePlay.drawUi(themes[this.gameState.level]);
    this.userTeam.addAll(generateTeam([Bowman, Swordsman], 1, 2));
    this.enemyTeam.addAll(generateTeam(this.enemyCharacters, 1, 2));
    this.addTeamPosition(this.userTeam, this.getUserStartPositions());
    this.addTeamPosition(this.enemyTeam, this.getEnemyStartPositions());
    this.gamePlay.redrawPositions(this.gameState.allPositions);
    GamePlay.showMessage(`Уровень: ${this.gameState.level}`);
  }

  onSaveGameClick() {
    this.stateService.save(GameState.from(this.gameState));
    GamePlay.showMessage('Игра сохранена');
  }

  onLoadGameClick() {
    GamePlay.showMessage('Игра загружается.');
    const load = this.stateService.load();
    if (!load) {
      GamePlay.showError('Ошибка загрузки.');
    }
    this.gameState.isUsersTurn = load.isUsersTurn;
    this.gameState.level = load.level;
    this.gameState.allPositions = [];
    this.gameState.points = load.points;
    this.gameState.statistics = load.statistics;
    this.gameState.selected = load.selected;
    this.userTeam = new Team();
    this.enemyTeam = new Team();
    load.allPositions.forEach((element) => {
      let char;
      switch (element.character.type) {
        case 'swordsman':
          char = new Swordsman(element.character.level);
          this.userTeam.addAll([char]);
          break;
        case 'bowman':
          char = new Bowman(element.character.level);
          this.userTeam.addAll([char]);
          break;
        case 'magician':
          char = new Magician(element.character.level);
          this.userTeam.addAll([char]);
          break;
        case 'undead':
          char = new Undead(element.character.level);
          this.enemyTeam.addAll([char]);
          break;
        case 'vampire':
          char = new Vampire(element.character.level);
          this.enemyTeam.addAll([char]);
          break;
        case 'daemon':
          char = new Daemon(element.character.level);
          this.enemyTeam.addAll([char]);
          break;
      }
      char.health = element.character.health;
      this.gameState.allPositions.push(new PositionedCharacter(char, element.position));
    });
    this.gamePlay.drawUi(themes[this.gameState.level]);
    this.gamePlay.redrawPositions(this.gameState.allPositions);
  }
}
