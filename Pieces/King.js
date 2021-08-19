class King extends Piece {
    constructor(x, y, isWhite, hasMoved = true) {
        super(x, y, isWhite);
        this.type = 'king';
        const c = isWhite ? 0 : 1;
        this.img = images[this.type][c];
        this.hasMoved = hasMoved;
    }

    move(x, y) {
        if (!this.hasMoved) this.hasMoved = true;

        // Castling
        if (abs(x - this.matrixposition.x) == 2) {
            const direction = x - this.matrixposition.x < 0 ? -1 : 1;
            const rookX = direction == -1 ? 0 : 7;
            const rook = board.getPieceAt(rookX, y);
            rook.move(x - direction, y);
        }

        super.move(x, y);
    }

    inCheck() {
        const enemies = this.isWhite ? board.blackPieces : board.whitePieces;
        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i];
            enemy.generateMoves();
            if (!enemy.taken && hasMove(enemy.moves, this.matrixposition.x, this.matrixposition.y)) return true;
        }
        return false;
    }

    generateMoves() {
        let moves = [];

        // Normal moves
        for (let x = -1; x < 2; x++) {
            for (let y = -1; y < 2; y++) {
                if (y != 0 || x != 0) {
                    const newX = this.matrixposition.x + x;
                    const newY = this.matrixposition.y + y;
                    if (this.withinBounds(newX, newY) && !this.attackingAlly(newX, newY)) {
                        moves.push([newX, newY]);
                    }
                }

            }
        }

        // Castling
        for (let x = 0; x < 8; x += 7) {
            const y = this.matrixposition.y;
            const piece = board.getPieceAt(x, y);
            if (piece && !this.blocked(x, y) && !this.hasMoved && piece.type == 'rook' && !piece.hasMoved) {
                const direction = x == 0 ? -1 : 1;
                moves.push([this.matrixposition.x + direction * 2, y]);
            }
        }

        super.generateMoves(moves);
    }
}