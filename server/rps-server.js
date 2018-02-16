class RpsGame {
    constructor(p1, p2) {
        this._players = [p1, p2];
        this._plays = [null, null];
        this._sendToPlayers('Rock Paper Scissors has started!');
        [0, 1].forEach(i => this._setPlayButtonsDisabled(i, false));

        this._players.forEach((player, i) => {
            player.on('play', (play) => {
                this._onPlay(i, play);
            })
        })
    }

    _sendToPlayer(playerIndex, msg) {
        this._players[playerIndex].emit('server message', msg)
    }

    _sendToPlayers(msg) {
        this._players.forEach(player => player.emit('server message', msg))
    }

    _onPlay(playerIndex, play) {
        if (this._plays[playerIndex] === null) {
            this._plays[playerIndex] = play;
            this._sendToPlayer(playerIndex, `You selected ${play}`);
            this._setPlayButtonsDisabled(playerIndex, true);
            this._sendToPlayer((playerIndex + 1) % 2, `Your opponent made a play.`);

            this._checkGameOver();
        }
    }

    _checkGameOver() {
        const turns = this._plays;

        if (turns[0] && turns[1]) {
            this._sendToPlayers('Game over! ' + turns.join(' vs '));
            this._getGameResult();
            this._plays = [null, null];
            this._sendToPlayers('Next round...');
            [0, 1].forEach((i) => this._setPlayButtonsDisabled(i, false))
        }
    }

    _getGameResult() {
        const p0 = RpsGame._decodePlay(this._plays[0]);
        const p1 = RpsGame._decodePlay(this._plays[1]);

        const distance = (p0 - p1 + 3) % 3;

        switch (distance) {
            case 0:
                //draw
                this._sendToPlayers('Draw!');
                break;
            case 1:
                //p0 won
                RpsGame._sendWinMessage(this._players[0], this._players[1]);
                break;
            case 2:
                //p1 won
                RpsGame._sendWinMessage(this._players[1], this._players[0]);
                break;
        }
    }

    _setPlayButtonsDisabled(playerIndex, disabled) {
        this._players[playerIndex].emit('buttonsDisabled', disabled);
    }

    static _sendWinMessage(winner, loser) {
        winner.emit('server message', 'You won!');
        loser.emit('server message', 'You lost!');
    }

    static _decodePlay(play) {
        switch (play) {
            case 'rock':
                return 0;
            case 'paper':
                return 1;
            case 'scissors':
                return 2;
            default:
                throw new Error(`Could not decode play ${play}`);
        }
    }
}

module.exports = RpsGame;
