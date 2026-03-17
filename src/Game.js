import Player from "./Player.js";
import PlayerView from "./PlayerView.js";

class Game {
    constructor(bottomPlayerDeck, topPlayerDeck) {
        this.bottomPlayerStartDeck = bottomPlayerDeck;
        this.topPlayerStartDeck = topPlayerDeck;
    }

    // Подготавливает колоды, создает игроков, запускает игру.
    play(needShuffleDecks, onGameOver) {
        const bottomPlayerDeck = needShuffleDecks
            ? this.copyAndShuffle(this.bottomPlayerStartDeck)
            : this.copyAndReverse(this.bottomPlayerStartDeck);

        const topPlayerDeck = needShuffleDecks
            ? this.copyAndShuffle(this.topPlayerStartDeck)
            : this.copyAndReverse(this.topPlayerStartDeck);

        const bottomPlayer = new Player(
            this,
            "Шериф уток",
            "sheriff.png",
            bottomPlayerDeck,
            new PlayerView(
                document.getElementById("bottomPlayerRow"),
                document.getElementById("bottomPlayerTable"),
                true,
            ),
        );

        const topPlayer = new Player(
            this,
            "Главарь псов",
            "bandit.png",
            topPlayerDeck,
            new PlayerView(
                document.getElementById("topPlayerRow"),
                document.getElementById("topPlayerTable"),
                false,
            ),
        );

        this.currentPlayer = topPlayer;
        this.oppositePlayer = bottomPlayer;

        this.playStaged(this, 0, onGameOver);
    }

    // Выполняет действия для некоторой стадии хода.
    // Переход к следующей стадии идет через самовызов в колбэке.
    playStaged(game, stage, onGameOver) {
        switch (stage) {
            case 0:
                game.currentPlayer.playNewCard(() =>
                    this.playStaged(game, 1, onGameOver),
                );
                break;
            case 1:
                game.currentPlayer.applyCards(() =>
                    this.playStaged(game, 2, onGameOver),
                );
                break;
            case 2:
                game.oppositePlayer.removeDeadAndCompactTable(() =>
                    this.playStaged(game, 3, onGameOver),
                );
                break;
            case 3:
                game.currentPlayer.removeDeadAndCompactTable(() =>
                    this.playStaged(game, 4, onGameOver),
                );
                break;
            case 4:
                const winner = this.getWinner(game);
                if (winner) {
                    onGameOver(winner);
                    return;
                }
                this.playStaged(game, 5, onGameOver);
                break;
            case 5:
                this.changePlayer(game);
                this.playStaged(game, 0, onGameOver);
                break;
            default:
                break;
        }
    }

    // Предоставляет картам необходимый доступ к объектам игры.
    // Самое полезное:
    // - currentPlayer.table - выложенные карты текущего игрока
    // - oppositePlayer.table - выложенные карты противоположенного игрока
    // - position - позиция текущей карты, начиная слева, считается с 0
    // - updateView - обновляет вид всех объектов игры,
    //   полезен когда действие некоторой карты повлияло на множество объектов
    getContextForCard(position) {
        return {
            currentPlayer: this.currentPlayer,
            oppositePlayer: this.oppositePlayer,
            position: position,
            updateView: () => this.updateView(),
        };
    }

    // Обновляет вид всех объектов игры.
    updateView() {
        this.currentPlayer.updateView();
        this.oppositePlayer.updateView();
    }

    getWinner(game) {
        if (this.hasNoPower(game.oppositePlayer)) {
            return game.currentPlayer;
        }
        if (this.hasNoPower(game.currentPlayer)) {
            return game.oppositePlayer;
        }
        return null;
    }

    hasNoPower(player) {
        return (
            player.currentPower <= 0 ||
            (player.deck.length === 0 && player.table.length === 0)
        );
    }

    changePlayer(game) {
        const player = game.currentPlayer;
        game.currentPlayer = game.oppositePlayer;
        game.oppositePlayer = player;
    }

    copyAndShuffle(array) {
        const result = [...array];
        result.sort(this.compareRandom);
        return result;
    }

    copyAndReverse(array) {
        const result = [...array];
        result.reverse();
        return result;
    }

    compareRandom() {
        return Math.random() - 0.5;
    }
}

export default Game;
