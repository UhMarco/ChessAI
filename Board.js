const startFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

class Board {
    constructor() {
        this.whitePieces = [];
        this.blackPieces = [];
        this.moves = [];
        this.drawnLastMove = 0;
        this.enPassant = null;
        this.lastEnPassant = null;
        this.selected = null;
        this.setupPieces()
    }

    setupPieces() {
        this.readFEN(startFEN);
    }

    readFEN(FEN) {
        this.whitePieces.length = 0
        this.blackPieces.length = 0
        const splitFEN = FEN.split(' ');
        const dashes = ['-', '–'];

        const boardFEN = splitFEN[0];
        let file = 0, rank = 0;

        for (let i = 0; i < boardFEN.length; i++) {
            const char = boardFEN.charAt(i);
            if (char == '/') {
                file = 0;
                rank++;
            } else {
                if (char >= '0' && char <= '9') {
                    file += parseInt(char);
                } else {
                    const colour = char == char.toUpperCase() ? 'w' : 'b';
                    const type = char.toLowerCase();
                    this.addPiece(type, colour, file, rank);
                    file++;
                }
            }
        }

        const moveFEN = splitFEN[1];
        switch (moveFEN) {
            case 'w':
                // White to move
                break;
            case 'b':
                // Black to move
                break;
        }

        const castlingFEN = splitFEN[2];
        if (!dashes.includes(castlingFEN)) {
            for (let i = 0; i < castlingFEN.length; i++) {
                const char = castlingFEN.charAt(i);
                const x = char == char.toUpperCase() ? 7 : 0;
                const y = char.toLowerCase() == 'k' ? 7 : 0;
                const rook = this.getPieceAt(x, y);
                const king = this.getPieceAt(4, y);
                if (rook && king) {
                    rook.hasMoved = false;
                    king.hasMoved = false;
                } else {
                    console.log('Invalid castling in FEN string.');
                }
            }
        }

        const enPassantFEN = splitFEN[3];
        if (!dashes.includes(enPassantFEN)) {
            let [cx, cy] = enPassantFEN.split('');
            let [x, y] = this.convertNotation(cx, cy);
            const piece = this.getPieceAt(x, y);
            if (piece && piece.type == 'pawn') {
                this.enPassant = piece;
            } else {
                console.log('Invalid en passant square in FEN string.');
            }
        }
    }

    getPieceAt(x, y) {
        for (let i = 0; i < this.whitePieces.length; i++) {
            const piece = this.whitePieces[i];
            if (!piece.taken && piece.matrixposition.x == x && piece.matrixposition.y == y) {
                return piece;
            }
        }
        for (let i = 0; i < this.blackPieces.length; i++) {
            const piece = this.blackPieces[i];
            if (!piece.taken && piece.matrixposition.x == x && piece.matrixposition.y == y) {
                return piece;
            }
        }
        return null;
    }

    select(piece) {
        this.selected = piece;
        piece.select();
        main.fill(0, 0, 0, 80);
        // main.rect(piece.pixelposition.x - tilesize / 2, piece.pixelposition.y - tilesize / 2, tilesize, tilesize);
        main.ellipse(piece.pixelposition.x, piece.pixelposition.y, tilesize * 1.5);
    }

    deselect(piece) {
        this.selected = null;
        piece.deselect();

        // Remove highlighting.
        main.clear(); // The base highlight is on the main layer.
        highlights.clear();
        drawBoard();
        if (this.drawnLastMove) this.drawnLastMove -= 1; // Keep last move indication when changing selection.
    }

    move(x, y) {
        this.lastEnPassant = this.enPassant;
        this.enPassant = null;
        this.moves.push(new Move(this.selected, this.selected.matrixposition, createVector(x, y), this.getPieceAt(x, y)));
        this.selected.move(x, y);
    }

    show() {
        const moves = this.moves;
        if (this.drawnLastMove < moves.length) {
            this.drawnLastMove = moves.length;

            const { startSquare, targetSquare } = moves[moves.length - 1];
            // main.fill(255, 0, 0, 50);
            main.fill(202, 158, 94, 115);
            main.rect(startSquare.x * tilesize, startSquare.y * tilesize, tilesize, tilesize);
            main.rect(targetSquare.x * tilesize, targetSquare.y * tilesize, tilesize, tilesize);

        }
        for (let i = 0; i < this.whitePieces.length; i++) {
            this.whitePieces[i].show();
        }
        for (let i = 0; i < this.blackPieces.length; i++) {
            this.blackPieces[i].show();
        }
    }

    convertNotation(cx, cy) {
        const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        let x = alphabet.indexOf(cx);
        let y = 8 - cy;
        return [x, y];
    }

    addPiece(type, colour, file, rank) {
        switch (type) {
            case 'k':
                if (colour == 'w') {
                    this.whitePieces.push(new King(file, rank, true));
                } else {
                    this.blackPieces.push(new King(file, rank, false));
                }
                break;

            case 'q':
                if (colour == 'w') {
                    this.whitePieces.push(new Queen(file, rank, true));
                } else {
                    this.blackPieces.push(new Queen(file, rank, false));
                }
                break;

            case 'b':
                if (colour == 'w') {
                    this.whitePieces.push(new Bishop(file, rank, true));
                } else {
                    this.blackPieces.push(new Bishop(file, rank, false));
                }
                break;

            case 'n':
                if (colour == 'w') {
                    this.whitePieces.push(new Knight(file, rank, true));
                } else {
                    this.blackPieces.push(new Knight(file, rank, false));
                }
                break;

            case 'r':
                if (colour == 'w') {
                    this.whitePieces.push(new Rook(file, rank, true));
                } else {
                    this.blackPieces.push(new Rook(file, rank, false));
                }
                break;

            case 'p':
                if (colour == 'w') {
                    const hasMoved = rank == 6 ? false : true;
                    this.whitePieces.push(new Pawn(file, rank, true, hasMoved));
                } else {
                    const hasMoved = rank == 1 ? false : true;
                    this.blackPieces.push(new Pawn(file, rank, false, hasMoved));
                }
                break;
        }
    }
}