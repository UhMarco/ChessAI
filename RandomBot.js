class RandomBot {
    constructor(colour = 'black') {
        this.colour = colour == 'white' ? true : false;
    }

    move() {
        const moves = [];
        const pieces = this.colour ? board.whitePieces : board.blackPieces;
        pieces.forEach(piece => {
            piece.generateMoves();
            piece.generateLegalMoves();
            if (!piece.taken && piece.moves.length) {
                moves.push(piece);
            }
        });

        const piece = moves[Math.floor(Math.random() * moves.length)];
        const [x, y] = piece.moves[Math.floor(Math.random() * piece.moves.length)];
        console.log(piece.type, board.getNotation(x, y).join(''));
        board.move(x, y, piece);
    }
}