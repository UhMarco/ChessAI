class Knight extends Piece {
    constructor(x, y, isWhite) {
        super(x, y, isWhite);
        this.type = 'knight';
        const c = isWhite ? 0 : 1;
        this.img = images[this.type][c];
    }

    generateMoves() {
        let moves = [];
        let possibleMoves = [[-2, -1], [-2, 1], [2, -1], [2, 1], [-1, -2], [1, -2], [-1, 2], [1, 2]];

        for (let i = 0; i < possibleMoves.length; i++) {
            let [x, y] = possibleMoves[i];
            x += this.matrixposition.x;
            y += this.matrixposition.y;
            if (this.withinBounds(x, y) && !this.attackingAlly(x, y)) {
                moves.push([x, y]);
            }
        }

        this.moves = moves;
    }
}