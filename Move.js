class Move {
    constructor(piece, startSquare, targetSquare, taken = null, castle = false) {
        this.piece = piece;
        this.startSquare = startSquare;
        this.targetSquare = targetSquare;
        this.taken = taken;
        this.castle = castle;

        if (piece.type == 'pawn' || taken) {
            board.halfMoveClock = 0;
        } else {
            board.halfMoveClock++;
        }
    }
}