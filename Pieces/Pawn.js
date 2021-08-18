class Pawn extends Piece {
    constructor(x, y, isWhite, hasMoved = true) {
        super(x, y, isWhite);
        this.type = 'pawn';
        const c = isWhite ? 0 : 1;
        this.img = images[this.type][c];
        this.hasMoved = hasMoved;
    }

    move(x, y) {
        if (!this.hasMoved) this.hasMoved = true;
        const direction = this.isWhite ? -1 : 1;

        if (abs(y - this.matrixposition.y) == 2) {
            // This pawn just double moved and can be captured by en passant.
            board.enPassant = this;
        }

        // Use the lastEnPassant variable as the board has already set enPassant to null.
        const pos = createVector(x, y - direction);
        if (board.lastEnPassant && board.lastEnPassant == board.getPieceAt(pos.x, pos.y)) {
            if (abs(x - this.matrixposition.x) == 1) {
                // This pawn just captured a pawn by en passant.
                board.lastEnPassant.taken = true;
                board.lastEnPassant = null;
            }
        }

        super.move(x, y);

        // Pawn promotion
        const finalY = this.isWhite ? 0 : 7;
        if (y == finalY) {
            board.promote(this);
        }
    }

    generateMoves() {
        let moves = [];
        const direction = this.isWhite ? -1 : 1;
        let x = this.matrixposition.x;
        let y = this.matrixposition.y + direction;
        let piece;

        // Normal move
        if (this.withinBounds(x, y) && !board.getPieceAt(x, y)) {
            moves.push([x, y]);
            // Double move
            if (!this.hasMoved && this.withinBounds(x, y + direction) && !board.getPieceAt(x, y + direction)) {
                moves.push([x, y + direction]);
            }
        }

        // Attack
        for (let i = -1; i < 2; i++) {
            if (i != 0) {
                if (this.withinBounds(x + i, y) && !this.attackingAlly(x + i, y)) {
                    piece = board.getPieceAt(x + i, y);
                    if (piece && piece.isWhite != this.isWhite) {
                        moves.push([x + i, y]);
                    }
                }
            }
        }

        // En passant
        for (let i = -1; i < 2; i++) {
            if (i != 0) {
                if (this.withinBounds(x + i, y - direction) && !this.attackingAlly(x + i, y - direction)) {
                    piece = board.getPieceAt(x + i, y - direction);
                    if (piece && piece.type == 'pawn' && board.enPassant == piece) {
                        moves.push([x + i, y]);
                    }
                }
            }
        }
        super.generateMoves(moves);
    }
}