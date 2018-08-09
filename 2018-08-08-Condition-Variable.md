---
layout: post
title: Condition Variable
---

Suppose we want to halt one thread and wait for a signal from another. We could use a sleeping-loop and keep checking an atomic-bool, or...

This is where `condition_variable` comes in. It allows us to force a thread to wait on a signal from another thread that is using the same condition variable.

On one end, we can either notify one other user who is `wait`ing, or all users who are `wait`ing.
On the other, we can use it to block exection (`wait`) until we receive a signal.

A small example:

```cpp
#include <iostream>
#include <thread>

void thread_func()
{
    std::cout << "Thread started!\n";
}

int main()
{
    std::thread t1(thread_func);
    
    for (int iii = 0; iii <= 100; ++iii)
    {
        std::cout << iii << ", ";
    }
    std::cout << "\n";
    
    t1.join();
}
```

If you run this ([perhaps use this](http://coliru.stackedicrooked.com)), "Thread started!" appears at a random point in (or, often, at the end of) the main function's output. Obviously there's no real need to line up these threads in anyway, considering they don't really do anything, but... just for arguments sake, let's say that we'd like the thread to *actually start doing its work* before the main thread drops into that for-loop. For this, the `condition_variable` is **perfect**! For the sake of this example, I'll be betraying my strongest instincts and declaring the `condition_variable` as a global, for the sake of brevity and lessening line-noise.

Let me first explain the mechanism of the `condition_variable`:
* 