const startFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

class Board {
    constructor(player = 'white') {
        this.player = player == 'white' ? true : false;

        this.frozen = false;

        this.pawnToPromote = null;
        this.turn = true; // true = white
        this.whitePieces = [];
        this.blackPieces = [];

        this.selected = null;
        this.moves = [];
        this.halfMoveClock = 0;
        this.fullMoveClock = 0;
        this.drawnLastMove = 0;
        this.enPassant = null;
        this.lastEnPassant = null;

        this.setupPieces()
    }

    setupPieces() {
        this.readFEN(startFEN);
    }

    getCharacter(type, isWhite) {
        let character = type[0];
        if (type == 'knight') character = 'n';
        if (isWhite) character = character.toUpperCase();
        return character;
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
        if (!this.frozen && piece.isWhite == this.turn) {
            this.selected = piece;
            piece.select();
            main.fill(0, 0, 0, 80);
            main.ellipse(piece.pixelposition.x, piece.pixelposition.y, tilesize * 1.5);
        }
    }

    deselect(piece) {
        this.selected = null;
        piece.deselect();

        // Remove highlighting.
        main.clear(); // The base highlight is on the main layer.
        highlights.clear();
        drawBoard();
        if (this.drawnLastMove) this.drawnLastMove -= 1; // Keep last move indication when changing selection.
        this.showCheck();
    }

    move(x, y, piece = this.selected) {
        if (!this.turn) this.fullMoveClock++;
        this.lastEnPassant = this.enPassant;
        this.enPassant = null;
        let castle = false;
        if (piece.type == 'king' && abs(x - piece.matrixposition.x) == 2) castle = true;
        const prevPos = piece.matrixposition;
        piece.move(x, y);
        const taken = this.getPieceAt(x, y) == piece ? null : this.getPieceAt(x, y);
        this.moves.push(new Move(piece, prevPos, createVector(x, y), taken, castle));
        this.turn = !this.turn; // Swap turns

        // Checkmate & Stalemate.
        if (this.whiteMoves() == 0) {
            if (this.whitePieces.find(e => e.type == 'king').inCheck()) {
                console.log('Checkmate!');
            } else {
                console.log('Draw: Stalemate!');
            }
            this.frozen = true;
        } else if (this.blackMoves() == 0) {
            if (this.blackPieces.find(e => e.type == 'king').inCheck()) {
                console.log('Checkmate!');
            } else {
                console.log('Draw: Stalemate!');
            }
            this.frozen = true;
        }

        // Threefold Repetition
        if (this.moves.length > 5) {
            const moves = [startFEN.split(' ')[0]];
            this.moves.forEach(({ FEN }) => moves.push(FEN.split(' ')[0]));
            let count = 0;
            for (let i = 0; i < moves.length; i++) {
                const FEN = moves[i];
                let count = 0;
                moves.forEach((compareFEN) => {
                    if (FEN == compareFEN) count++;
                });
                if (count >= 3) {
                    console.log('Draw: Threefold Repetition!');
                    this.frozen = true;
                    break;
                }
            }
        }

        // Fifty-Move Rule
        const check = (move) => move.piece.type == 'pawn' || move.taken;
        if (this.halfMoveClock >= 100 && !this.moves.some(check)) {
            console.log('Draw: Fifty-Move Rule!');
            this.frozen = true;
        }

        if (!board.frozen && bot.colour == this.turn) bot.move();
    }

    show() {
        const moves = this.moves;
        if (this.drawnLastMove < moves.length) {
            this.drawnLastMove = moves.length;

            const { startSquare, targetSquare } = moves[moves.length - 1];
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

    showCheck() {
        for (let i = 0; i < 2; i++) {
            const pieces = i == 0 ? board.whitePieces : board.blackPieces;
            const king = pieces.find(element => element.type == 'king');
            if (king.inCheck()) {
                const { x, y } = king.pixelposition;
                main.fill(255, 0, 0, 100);
                main.rect(x - tilesize / 2, y - tilesize / 2, tilesize, tilesize);
            }
        }
    }

    whiteMoves() {
        let moves = 0;
        for (let i = 0; i < this.whitePieces.length; i++) {
            const piece = this.whitePieces[i];
            piece.generateMoves();
            piece.generateLegalMoves();
            moves += piece.moves.length;
        }
        return moves;
    }

    blackMoves() {
        let moves = 0;
        for (let i = 0; i < this.blackPieces.length; i++) {
            const piece = this.blackPieces[i];
            piece.generateMoves();
            piece.generateLegalMoves();
            moves += piece.moves.length;
        }
        return moves;
    }

    convertNotation(cx, cy) {
        const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const x = alphabet.indexOf(cx);
        const y = 8 - cy;
        return [x, y];
    }

    getNotation(cx, cy) {
        const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const x = alphabet[cx];
        const y = 8 - cy;
        return [x, y];
    }

    readFEN(FEN) {
        this.whitePieces.length = 0;
        this.blackPieces.length = 0;
        const splitFEN = FEN.split(' ');
        const dashes = ['-', '–'];

        const boardFEN = splitFEN[0];

        // Logic for boardFEN reading borrowed from Sebastian Lague's Coding Adventure video.
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
        this.turn = moveFEN == 'w' ? true : false;

        const castlingFEN = splitFEN[2];
        if (!dashes.includes(castlingFEN)) {
            for (let i = 0; i < castlingFEN.length; i++) {
                const char = castlingFEN.charAt(i);
                const x = char.toLowerCase() == 'k' ? 7 : 0;
                const y = char == char.toUpperCase() ? 7 : 0;
                const rook = this.getPieceAt(x, y);
                const king = this.getPieceAt(4, y);
                if (rook && king) {
                    rook.hasMoved = false;
                    king.hasMoved = false;
                } else {
                    console.log('Invalid castling in FEN string:', char);
                }
            }
        }

        const enPassantFEN = splitFEN[3];
        if (!dashes.includes(enPassantFEN)) {
            let [cx, cy] = enPassantFEN.split('');
            let [x, y] = this.convertNotation(cx, cy);
            const direction = this.turn ? 1 : -1;
            const piece = this.getPieceAt(x, y + direction);
            if (piece && piece.type == 'pawn') {
                this.enPassant = piece;
            } else {
                console.log('Invalid en passant square in FEN string.');
            }
        }

        this.halfMoveClock = splitFEN[4];
        this.fullMoveClock = splitFEN[5];
    }

    generateFEN() {
        let FEN = [];

        // boardFEN
        for (let y = 0; y < 8; y++) {
            let file = [];
            let gap = 0;
            for (let x = 0; x < 8; x++) {
                const piece = this.getPieceAt(x, y);
                if (piece) {
                    if (gap) file.push(gap);
                    file.push(this.getCharacter(piece.type, piece.isWhite));
                    gap = 0;
                } else {
                    gap++;
                }
            }
            if (file.length) FEN = FEN.concat(file);
            if (gap) FEN.push(gap);
            if (y != 7) FEN.push('/');
        }
        FEN.push(' ');

        // Active colour
        const ac = !board.turn ? 'w' : 'b';
        FEN.push(ac, ' ');

        // Castling
        const castling = []
        for (let w = 1; w >= 0; w--) {
            const y = w ? 7 : 0;
            const king = this.getPieceAt(4, y);
            if (king && !king.hasMoved) {
                for (let x = 7; x >= 0; x -= 7) {
                    const rook = this.getPieceAt(x, y);
                    if (rook && !rook.hasMoved) {
                        let char = !x ? 'q' : 'k';
                        if (w) char = char.toUpperCase();
                        castling.push(char);
                    }
                }
            }
        }
        FEN = FEN.concat(castling);
        if (castling.length == 0) FEN.push('-');
        FEN.push(' ');

        // En passant
        if (this.enPassant) {
            const [x, y] = this.getNotation(this.enPassant.matrixposition.x, this.enPassant.matrixposition.y);
            const direction = this.turn ? -1 : 1;
            FEN.push(x, y + direction);
        } else {
            FEN.push('-');
        }
        FEN.push(' ');

        // Halfmove
        FEN.push(this.halfMoveClock, ' ');

        // Fullmove
        FEN.push(this.fullMoveClock);

        return FEN.join('');
    }

    promote(pawn, selectionMade = false, promoteTo = null) {
        if (!selectionMade) {
            this.frozen = true;
            this.pawnToPromote = pawn;
            ui.noStroke();
            ui.fill(0, 0, 0, 150);
            const y = pawn.isWhite ? 1 : 7;
            const direction = pawn.isWhite ? 1 : -1;
            ui.rect(pawn.matrixposition.x * tilesize, y * tilesize, tilesize, tilesize * direction * 4, 20);
            const index = pawn.isWhite ? 0 : 1;
            const types = ['queen', 'rook', 'knight', 'bishop'];
            for (let i = 0; i < types.length; i++) {
                let newY = pawn.isWhite ? i : i + 4;
                ui.image(images[types[i]][index], pawn.matrixposition.x * tilesize, (newY + direction) * tilesize, tilesize, tilesize);
            }
        } else {
            const { x, y } = pawn.matrixposition;
            if (pawn.isWhite) {
                const index = this.whitePieces.indexOf(pawn);
                this.whitePieces.splice(index, 1);
                switch (promoteTo) {
                    case 'queen':
                        this.whitePieces.push(new Queen(x, y, pawn.isWhite));
                        break;
                    case 'rook':
                        this.whitePieces.push(new Rook(x, y, pawn.isWhite));
                        break;
                    case 'knight':
                        this.whitePieces.push(new Knight(x, y, pawn.isWhite));
                        break;
                    case 'bishop':
                        this.whitePieces.push(new Bishop(x, y, pawn.isWhite));
                        break;
                }
            } else {
                const index = this.blackPieces.indexOf(pawn);
                this.blackPieces.splice(index, 1);
                switch (promoteTo) {
                    case 'queen':
                        this.blackPieces.push(new Queen(x, y, pawn.isWhite));
                        break;
                    case 'rook':
                        this.blackPieces.push(new Rook(x, y, pawn.isWhite));
                        break;
                    case 'knight':
                        this.blackPieces.push(new Knight(x, y, pawn.isWhite));
                        break;
                    case 'bishop':
                        this.blackPieces.push(new Bishop(x, y, pawn.isWhite));
                        break;
                }
            }
            board.frozen = false;
            ui.clear();
            this.pawnToPromote = null;
            drawBoard();
            if (this.drawnLastMove) this.drawnLastMove -= 1;
            this.showCheck();
        }
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