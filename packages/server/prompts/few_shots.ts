const a = {
    "Can you search for the latest quantum computing breakthroughs?":
        "I don't have web access.",
};

const b = {
    "Calculate the number of unique ways to arrange the letters in the word SUCCESS.":
        `Alright, let's tackle 'SUCCESS' and see just how unique it can get!
### Step 1: Count the Letters  
The word 'SUCCESS' has 7 letters, but it’s no free-for-all—there are repeats!  
- S: 3 times  
- U: 1 time  
- C: 2 times  
- E: 1 time  
### Step 2: The Formula for Permutations with Repetition 
When letters repeat, we divide to avoid overcounting. The magic formula is:  
$$
\frac{n!}{k_1! \cdot k_2! \cdot \ldots \cdot k_m!}
$$  
Here, (n) is the total number of letters, and (k_i) are the frequencies of each unique letter.
### Step 3. Plug in the Values
Let’s compute:  
$$
\frac{7!}{3! \cdot 1! \cdot 2! \cdot 1!} = 420
$$

### Step 4: Reveal the Result  
There are 420 unique arrangements of 'SUCCESS'. Mathematically satisfying, isn’t it? It’s as if every version of success gets its own unique permutation!`,


    "Calculate the number of unique ways to arrange the letters in the word MISSISSIPPI.":
        `Ready for some permutation wizardry? Let’s decode 'MISSISSIPPI'!
### Step 1: Count the Letters  
'MISSISSIPPI' has 11 letters. But like a social network with cliques, some letters appear in multiples:  
- M: 1  
- I: 4  
- S: 4  
- P: 2
### Step 2: Apply the Permutation Formula for Repetition  
The formula for such a case is:  
$$
\frac{n!}{k_1! \cdot k_2! \cdot \ldots \cdot k_m!}
$$
### Step 3: Plug in the Values
Here’s where we let the math do its magic:  
$$
\frac{11!}{1! \cdot 4! \cdot 4! \cdot 2!}
$$
### Step 4: Simplify Step-by-Step  
Let’s break it down:  
- (11! = 39,916,800)  
- (4! = 24)  
- (2! = 2)  
#### Substituting these values:  
$$
\frac{39,916,800}{1 \cdot 24 \cdot 24 \cdot 2} = 34,650
$$
### Step 5: The Grand Finale
There are 34,650 unique arrangements of 'MISSISSIPPI'.`,
};

const c = {
    "Render a Greek statue with warm marble tones and realistic proportions.":
        "I don't have the ability to generate images right now. ",
};

const d = {
    "Demonstrate markdown formatted text.": `
## Headers
~~~markdown
# Large Header
## Medium Header
### Small Header
~~~
## Ordered Lists
1. First Item
2. Second Item
   1. Subitem 1
   2. Subitem 2
3. Third Item
## Unordered Lists
- First Item
- Second Item
  - Subitem 1
  - Subitem 2
## Links
[Visit OpenAI](https://openai.com/)
## Images
![Example Image](example.jpg)
## Inline Code
\`console.log('Hello, Markdown!')\`
## Code Blocks
~~~javascript
console.log(marked.parse('A Description List:\\n'
                 + ':   Topic 1   :  Description 1\\n'
                 + ': **Topic 2** : *Description 2*'));
~~~
## Tables
| Name    | Value |
|---------|-------|
| Item A  | 10    |
| Item B  | 20    |
## Blockquotes
> Markdown makes writing beautiful.
> - Markdown Fan
## Horizontal Rule
---
## Font: Bold and Italic
**Bold Text**  
*Italic Text*
## Font: Strikethrough
~~Struck-through text~~
## Math 
~~~markdown
$$
c = \\\\pm\\\\sqrt{a^2 + b^2}
$$`,
};

export default {a, b, c, d};
