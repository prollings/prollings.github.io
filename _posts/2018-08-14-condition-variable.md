---
layout: post
title: Condition Variable
tags: c++ threading
---

`condition_variable` allows us to force a thread to wait on a signal from another thread that is using the same condition variable.

On one end, we can use it to block execution (`wait`) until we receive a signal.
On the other, we can either notify one waiting thread, or all waiting threads.

A small example without `condition_variable`:

{% highlight cpp linenos %}
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
{% endhighlight %}

If you run this ([perhaps use this](http://coliru.stacked-crooked.com)), "Thread started!" appears at a random point in (or, often, at the end of) the main function's output. Obviously there's no real need to line up these threads in anyway, considering they don't really do anything, but... just for argument's sake, let's say that we'd like the thread to *actually start doing its work* before the main thread drops into that for-loop. For this, the `condition_variable` is **perfect**!

For the sake of this example, I'll be betraying my strongest instincts and declaring the `condition_variable` as a global.

{% highlight cpp linenos %}
#include <iostream>
#include <thread>
#include <condition_variable>

std::condition_variable cv; // disgusting

void thread_func()
{
	std::cout << "Thread started!\n"; // 3
	cv.notify_one(); // 4
	// do stuff // 5
}

int main()
{
	std::thread t1(thread_func); // 1
	std::mutex mtx;
	std::unique_lock<std::mutex> lock(mtx);
	cv.wait(lock); // 2
	// 6
	// 7
	for (int iii = 0; iii <= 100; ++iii)
	{
		std::cout << iii << ", ";
	}
	std::cout << "\n";
	
	t1.join();
}
{% endhighlight %}

Let's go through that code step by step:
1. Main thread starts thread 1
2. Main thread calls `wait` on the `condition_variable` which blocks execution (it unlocks the `lock` that it's been given)
3. `t1` starts
4. `t1` calls `notify_one`
5. `t1` continues with its work
6. Main thread wakes up as the call to `wait` is now unblocked
7. Main thread continues doing its work

Of course this can work in the other direction too, we may want to `wait` in `t1` until the main thread signals for continuation.

## Spurious Wakeups

I should also explain that the above code is *somewhat dangerous*, as `condition_variables` are vulnerable to *spurious wakeups*.
I won't explain exactly why spurious wakeups happen (as I don't fully understand it myself),
but I can explain how `condition_variable` lets you side-step that risk all together.
The `wait` function has an overload that accepts a predicate (something callable that returns a bool).
If the result is `true`, then the wakeup *wasn't* spurious, and `wait` stops blocking.
If it is `false`, then the wakeup was a false alarm, and it continues waiting.

It will normally look something like this:

```cpp 
wait(lock, [&](){ return ready; });
```
Where `ready` is some bit of shared state between threads or an expression involving said context.

## Closing Thoughts

Despite the rubbish example I've used above, it really is actually pretty useful.
One thing I found it useful for was getting a persistent worker thread to sleep until it had been given a job to do,
where an alternative would be to have the thread wake up and check for work constantly.

So, although it's not the best example, hopefully it gets across the mechanics of the thing.
