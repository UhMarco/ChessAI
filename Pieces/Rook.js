class Rook extends Piece {
    constructor(x, y, isWhite, hasMoved = true) {
        super(x, y, isWhite);
        this.type = 'rook';
        const c = isWhite ? 0 : 1;
        this.img = images[this.type][c];
        this.hasMoved = hasMoved;
    }

    move(x, y) {
        if (!this.hasMoved) this.hasMoved = true;
        super.move(x, y);
    }

    generateMoves() {
        let moves = []

        // Horizontal
        for (let x = 0; x < 8; x++) {
            let y = this.matrixposition.y;
            if (x != this.matrixposition.x) {
                if (!this.attackingAlly(x, y) && !this.blocked(x, y)) {
                    moves.push([x, y]);
                }
            }
        }

        // Vertical
        for (let y = 0; y < 8; y++) {
            let x = this.matrixposition.x;
            if (y != this.matrixposition.y) {
                if (!this.attackingAlly(x, y) && !this.blocked(x, y)) {
                    moves.push([x, y]);
                }
            }
        }

        super.generateMoves(moves);
    }
}