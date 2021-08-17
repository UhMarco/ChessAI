class Bishop extends Piece {
    constructor(x, y, isWhite) {
        super(x, y, isWhite);
        this.type = 'bishop';
        const c = isWhite ? 0 : 1;
        this.img = images[this.type][c];
    }

    generateMoves() {
        let moves = [];

        for (let i = 0; i < 8; i++) {
            let x = i;
            let y = this.matrixposition.y - (this.matrixposition.x - i);
            if (x != this.matrixposition.x && this.withinBounds(x, y) && !this.blocked(x, y) && !this.attackingAlly(x, y)) {
                moves.push([x, y]);
            }
        }

        for (let i = 0; i < 8; i++) {
            let x = this.matrixposition.x + (this.matrixposition.y - i);
            let y = i;
            if (x != this.matrixposition.x && this.withinBounds(x, y) && !this.blocked(x, y) && !this.attackingAlly(x, y)) {
                moves.push([x, y]);
            }
        }

        super.generateMoves(moves);
    }
}