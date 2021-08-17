class Piece {
    constructor(x, y, isWhite) {
        this.matrixposition = createVector(x, y);
        this.pixelposition = createVector(x * tilesize + tilesize / 2, y * tilesize + tilesize / 2);

        this.selected = false;
        this.drawnMoves = false;
        this.moves = [];
        this.taken = false;
        this.isWhite = isWhite;
        this.img;
    }

    show() {
        if (!this.taken) {
            main.imageMode(CENTER);
            main.image(this.img, this.pixelposition.x, this.pixelposition.y, tilesize, tilesize);
            if (this.selected && !this.drawnMoves) {
                this.drawnMoves = true;
                for (let i = 0; i < this.moves.length; i++) {
                    let move = this.moves[i];
                    let [x, y] = move;
                    highlights.fill(0, 0, 0, 100);
                    highlights.noStroke();
                    highlights.circle(x * tilesize + tilesize / 2, y * tilesize + tilesize / 2, tilesize / 3.5);
                }
            }
        }
    }

    select() {
        this.selected = true;
        this.generateMoves();
    }

    deselect() {
        this.selected = false;
        this.drawnMoves = false;
    }

    withinBounds(x, y) {
        if (x >= 0 && y >= 0 && x < 8 && y < 8) {
            return true;
        }
        return false;
    }

    attackingAlly(x, y) {
        const piece = board.getPieceAt(x, y);
        if (piece && !piece.taken && piece.isWhite === this.isWhite) {
            return true;
        }
        return false;
    }

    blocked(x, y) {
        let stepDirectionX = x - this.matrixposition.x;
        if (stepDirectionX > 0) {
            stepDirectionX = 1;
        } else if (stepDirectionX < 0) {
            stepDirectionX = -1;
        }

        let stepDirectionY = y - this.matrixposition.y;
        if (stepDirectionY > 0) {
            stepDirectionY = 1;
        } else if (stepDirectionY < 0) {
            stepDirectionY = -1;
        }

        let tempPos = createVector(this.matrixposition.x, this.matrixposition.y);
        tempPos.x += stepDirectionX;
        tempPos.y += stepDirectionY;
        while (tempPos.x != x || tempPos.y != y) {
            let piece = board.getPieceAt(tempPos.x, tempPos.y);
            if (piece && !piece.taken) return true;
            tempPos.x += stepDirectionX;
            tempPos.y += stepDirectionY;
        }

        return false;
    }

    move(x, y) {
        const piece = board.getPieceAt(x, y);
        if (piece) {
            piece.taken = true;
        }
        this.matrixposition = createVector(x, y);
        this.pixelposition = createVector(x * tilesize + tilesize / 2, y * tilesize + tilesize / 2);
    }
    generateMoves() { }

}