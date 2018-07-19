class RpsGame {
    constructor(p1, p2) {
        this._players = [p1, p2];
        this._plays = [null, null];
        this._sendToPlayers("Rock Paper Scissors has started!");

        this._players.forEach((player, i) => {
            player.emit("game start");
            player.on("play", (play) => {
                this._onPlay(i, play);
            })
        })
    }

    _sendToPlayer(playerIndex, text, type) {
        this._players[playerIndex].emit("server message", { text, type });
    }

    _sendToPlayers(text, type) {
        this._players.forEach(player => player.emit("server message", { text, type }));
    }

    _onPlay(playerIndex, play) {
        if (this._plays[playerIndex] === null) {
            this._plays[playerIndex] = play;
            this._sendToPlayer(playerIndex, `You selected ${play}`);
            this._players[playerIndex].emit("play accepted");
            this._sendToPlayer((playerIndex + 1) % 2, "Your opponent made a play.", "warning");

            this._checkGameOver();
        }
    }

    _checkGameOver() {
        const turns = this._plays;

        if (turns[0] && turns[1]) {
            this._sendToPlayers(`Game over! ${turns.join(' vs ')}`);
            this._getGameResult();
            this._plays = [null, null];
            this._sendToPlayers("Next round…");
            this._players.forEach(player => {
                player.emit("game start")
            });
        }
    }

    _getGameResult() {
        const p0 = RpsGame._decodePlay(this._plays[0]);
        const p1 = RpsGame._decodePlay(this._plays[1]);

        const distance = (p0 - p1 + 3) % 3;

        switch (distance) {
            case 0:
                //draw
                this._sendToPlayers("Draw!");
                break;
            case 1:
                //p0 won
                this._sendWinLossMessages(0, 1);
                break;
            case 2:
                //p1 won
                this._sendWinLossMessages(1, 0);
                break;
        }
    }

    _sendWinLossMessages(winnerIndex, loserIndex) {
        this._sendToPlayer(winnerIndex, "You won!", "positive");
        this._sendToPlayer(loserIndex, "You lost!", "negative");
    }

    static _decodePlay(play) {
        switch (play) {
            case "rock":
                return 0;
            case "paper":
                return 1;
            case "scissors":
                return 2;
            default:
                throw new Error(`Could not decode play ${play}`);
        }
    }
}

module.exports = RpsGame;
