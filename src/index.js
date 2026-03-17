import Card from "./Card.js";
import Game from "./Game.js";
import TaskQueue from "./TaskQueue.js";
import SpeedRate from "./SpeedRate.js";

// Отвечает является ли карта уткой.
function isDuck(card) {
    return card instanceof Duck;
}

// Отвечает является ли карта собакой.
function isDog(card) {
    return card instanceof Dog;
}

// Дает описание существа по схожести с утками и собаками
function getCreatureDescription(card) {
    if (isDuck(card) && isDog(card)) {
        return "Утка-Собака";
    }
    if (isDuck(card)) {
        return "Утка";
    }
    if (isDog(card)) {
        return "Собака";
    }
    return "Существо";
}

class Creature extends Card {
    getDescriptions() {
        return [getCreatureDescription(this), ...super.getDescriptions()];
    }
}

// Основа для утки.
class Duck extends Creature {
    constructor() {
        super("Мирная утка", 2, "sheriff.png");
    }
    quacks() {
        console.log("quack");
    }
    swims() {
        console.log("float: both;");
    }
}

// Основа для собаки.
class Dog extends Creature {
    constructor(name = "Пес-бандит", power = 3) {
        super(name, power, "bandit.png");
    }
}

class Trasher extends Dog {
    constructor() {
        super("Громила", 5);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            super.modifyTakenDamage(value - 1, fromCard, gameContext, continuation);
        })
    }

    getDescriptions() {
        return ["Получает на 1 меньше урона", ...super.getDescriptions()];
    }
}

class Gatling extends Creature {
    constructor() {
        super("Гатлинг", 6, "");
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        taskQueue.push((onDone) => this.view.showAttack(onDone));

        for (const enemyCard of gameContext.oppositePlayer.table) {
            if (!enemyCard) {
                continue;
            }
            taskQueue.push((task) => this.dealDamageToCreature(2, enemyCard, gameContext, task));
        }
        taskQueue.continueWith(continuation);
    }
}

class Lad extends Dog {
    constructor() {
        super("Браток", 2);
    }

    static getInGameCount() {
        return this.inGameCount || 0;
    }

    static setInGameCount(value) {
        this.inGameCount = value;
    }

    static getBonus() {
        const count = this.getInGameCount();
        return (count * (count + 1)) / 2;
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        continuation()
    }

    doBeforeRemoving(continuation) {
        Lad.setInGameCount(Lad.getInGameCount() - 1);
        continuation()
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        continuation(value + Lad.getBonus());
    }
    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        continuation(value - Lad.getBonus());
    }

    getDescriptions() {
        return [
            "получает меньше урона и наносит больше урона чем больше братков находятся в игре",
        ];
    }
}

const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
    new Lad(),
    new Gatling(),
];
const banditStartDeck = [
    new Trasher(),
    new Dog(),
    new Dog(),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert("Победил " + winner.name);
});
