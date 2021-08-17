class Queen extends Piece {
    constructor(x, y, isWhite) {
        super(x, y, isWhite);
        this.type = 'queen';
        const c = isWhite ? 0 : 1;
        this.img = images[this.type][c];
    }

    generateMoves() {
        let moves = [];

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

        // Diagonal
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