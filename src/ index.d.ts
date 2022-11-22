declare namespace v3towav {
    export function v3BufferToWav(bf: string): Buffer;
}

declare module 'v3towav' {
    export = v3towav;
}
