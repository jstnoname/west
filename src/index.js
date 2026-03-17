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
            super.modifyTakenDamage(
                value - 1,
                fromCard,
                gameContext,
                continuation,
            );
        });
    }

    getDescriptions() {
        return ["Получает на 1 меньше урона", ...super.getDescriptions()];
    }
}

class Lad extends Dog {
    constructor() {
        super("Браток", 2);

    }

    static getInGameCount() { return this.inGameCount || 0; }
    static setInGameCount(value) { this.inGameCount = value; }

    doAfterComingIntoPlay(continuation){
        this.inGameCount++;
        continuation()
    }

    doBeforeRemoving(continuation){

    }

    modifyDealedDamageToCreature(value, fromCard, gameContext, continuation){

    }

    getDescriptions() {
        return [
            "получает меньше урона и наносит больше урона чем больше братков находятся в игре",
        ];
    }
}

// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [new Duck(), new Duck(), new Duck()];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [new Trasher()];

// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert("Победил " + winner.name);
});
