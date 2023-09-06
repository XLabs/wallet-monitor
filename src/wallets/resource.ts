export class Resource {
    private id: string;
    private locked = false;
    private discarded = false;

    constructor (id: string) {
        this.id = id;
    }

    getId () {
        return this.id;
    }

    discard () {
        this.discarded = true;
    }

    retain () {
        this.discarded = false;
    }

    lock () {
        this.locked = true;
    }

    unlock () {
        this.locked = false;
    }

    isAvailable () {
        return !this.locked && !this.discarded;
    }

    isLocked () {
        return this.locked;
    }

    isDiscarded () {
        return this.discarded;
    }
}