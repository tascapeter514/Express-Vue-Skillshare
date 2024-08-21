import { expect, test, describe, it } from 'vitest'
import { deleteTalk } from '/app.js'


// const req = {
//     params: { title: 'Test One'}
// }

describe('deleteTalk', () => {
    it('value passed to title is a string', async () => {
        const title = "Test One";
        const encodedTitle = encodeURIComponent(title);
        const url = `http://localhost:3000/talks/${encodedTitle}`;

        const deleteResp = await fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        });
        expect(deleteResp.status).toBe(204);
        const responseBody = await deleteResp.json().catch(() => ({}))
        expect(typeof title).toBe('string')
    })
})

// const deleteResp = await fetch("http://localhost:3000/talk:title", {
//             method: "DELETE",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             params: {title: "Test One"}
//         });
//         expect(typeof deleteResp.params.title).toBe('string');