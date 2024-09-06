type Square = {
    color: "red" | "blue" | "green";
};

type TAnimator = {
    (
        this: Square,
        numSpins: number,
        direction: "clockwise" | "counterclockwise",
    ): string;
};

export const animator = function (
    numSpins: number = 2,
    direction: "clockwise" | "counterclockwise" = "counterclockwise",
) {
    console.log(this.color, numSpins, direction);
    return "Hello World";
} satisfies TAnimator;

animator.call({ color: "blue" }, 77);
