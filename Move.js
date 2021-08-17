class Move {
    constructor(piece, startSquare, targetSquare, taken = null) {
        this.piece = piece;
        this.startSquare = startSquare;
        this.targetSquare = targetSquare;
        this.taken = taken;
    }
}