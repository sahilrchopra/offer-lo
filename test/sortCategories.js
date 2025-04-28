function sortCategories(inputJson) {
    const categories = JSON.parse(inputJson);
    const idMap = new Map();
    const childrenMap = new Map();
    const roots = [];

    for (const cat of categories) {
        idMap.set(cat.id, cat);
        const parentId = cat.parent_id;
        if (parentId === null) {
            roots.push(cat);
        } else {
            if (!childrenMap.has(parentId)) {
                childrenMap.set(parentId, []);
            }
            childrenMap.get(parentId).push(cat);
        }
    }

    const result = [];
    for (const root of roots) {
        const stack = [root];
        console.log("Stack:", stack);
        while (stack.length > 0) {
            const node = stack.pop();
            result.push(node);
            const children = childrenMap.get(node.id) || [];
            for (let i = 0; i<children.length  ; i++) {
                stack.push(children[i]);
            }
        }
    }

    return JSON.stringify(result);
}

const testCase = 
    {
        input: `[
            {
                "name": "Accessories",
                "id": 1,
                "parent_id": 20
            },
            {
                "name": "activewear",
                "id": 25,
                "parent_id": 2
            },
            {
                "name": "Clothing",
                "id": 2,
                "parent_id": 20
            },
            {
                "name": "Watches",
                "id": 57,
                "parent_id": 1
            },
            {
                "name": "Men",
                "id": 20,
                "parent_id": null
            }
        ]`,
    };

    const result = sortCategories(testCase.input);
    console.log("Result:", result);
