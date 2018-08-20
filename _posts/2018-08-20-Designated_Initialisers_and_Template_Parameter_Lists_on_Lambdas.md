---
layout: post
title: "C++20: Designated Initialisers and Template Parameter Lists on Lambdas"
tags: c++ c++20
---

## In Short

Designated Initialisers let us tag values in initialisers so that we can see what they are, and be alerted when the members we're initialising change order.

Template-able lambdas pretty much just let us stick template parameter lists to lambdas so that they behave like normal template functions.

## Designated Initialisers

Or with a `Z`.

Initialisers, as in these things:

{% highlight cpp linenos %}
struct SweetType {
    int   meaning;
    int   nintendo;
    float pi;
    float numberwang;
};

int main() {
    SweetType st{ 42, 64, 3.14, 44.44 }; // initialiser
}
{% endhighlight %}

The values in the curly-braces are initialising the members of the `SweetType` object.
All well and good. Except that we need to remember the order in which the members are declared, otherwise we could be putting the wrong values into the wrong members.
And if the member order in the struct is changed, we have to find and change all the initialisers without the compiler's help, or just let the wrong values go into the wrong members.
This is where designated initiali**z**ers come in handy; they essentially let us label the list with the names of the members.

{% highlight cpp linenos %}
    SweetType st{
        .meaning = 42,
        .nintendo = 64,
        .pi = 3.14,
        .numberwang = 44.44
    };
{% endhighlight %}

That's a lot nicer. It helps us understand at a glance what exactly the values are being assigned to.
Note that we **cannot** reorder the members of the struct without reordering the initialiser (and vice-versa) or the compiler will throw a fit.
It needs to be this way because:
* Compilers aren't allowed to reorder struct/class members
* Initialiser eval order is guaranteed to be left to right, so any mutations that happen in it, or in the initialised member's constructor, happen in the same, obvious, order

Despite having to be in declaration order, we *can* skip members like so:
{% highlight cpp linenos %}
    SweetType st{
        .nintendo = 64,
        .numberwang = 44.44
    };
{% endhighlight %}

The skipped members are then default initialised.

## Template Parameter Lists on Lambdas

C++14 introduced generic lambdas by using the `auto` keyword in place of types in their parameter lists, as such:

{% highlight cpp linenos %}
int main() {
    using namespace std::string_literals;
    
    auto gl = [](auto x, auto y, auto z) {
        return x + y + z;
    };
    std::cout << gl(1, 2, 3) << "\n"; // (int)(int, int, int)
    std::cout << gl(1, 2, 3.3) << "\n"; // (double)(int, int, double)
    std::cout << gl("1"s, "2"s, "3"s) << "\n"; // all std::strings
}
{% endhighlight %}

There are three different versions of the `gl` lambda there.
1. takes all `int`s, returns an `int`
2. takes two `ints`, and a `double`, returns a `double`
3. takes all `std::string`s, returns a `std::string`

A new version of that `gl` is instantiated for each different combination of argument types.
As long as `operator+` is defined for whichever combination of types we use, it'll work.

[To use the paper's examples](http://www.open-std.org/jtc1/sc22/wg21/docs/papers/2017/p0428r1.pdf),
we can't easily define a lambda that is constrained to taking a `std::vector` of any type,
or use a static member of a type with the `auto` syntax.
So suddenly templates become very useful:

{% highlight cpp linenos %}
int main() {
    auto gottaBeVector = []<typename T>(std::vector<T> vec){
        // it's a vector, what fun
    };
    auto staticMember = []<typename T>(T thing){
        auto npos = T::npos; // has to have the static member "npos", so probably a string of some sort
        // do stuff with npos
    };
}
{% endhighlight %}

This basically just makes it a lot nicer, and more familiar, to write generic lambdas.
