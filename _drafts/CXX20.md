---
layout: post
title: Some C++20 Highlights
tags: c++ c++20
---

In this post I'm going to cherry pick a few stand-out (for me) C++20 features, and try to explain them.

The list:
* Designated Initialisers
* Template parameter lists on lambdas

## Designated Initialisers

Or with a `Z`.

Initialisers, you ask? What are they? These guys:

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

You see, the values in the curly-braces are initialising the members of the `SweetType` object.
All well and good. Except that we need to remember the order in which the members are declared, otherwise we could be putting the wrong values into the wrong members.
This is where designated initiali*z*ers come in handy; they essentially let us label the list with the names of the members.

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

## Template Parameter Lists on Lambdas

C++14 introduced generic lambdas by using the `auto` keyword as types in their parameter lists, as such:

{% highlight cpp linenos %}
int main() {
    using namespace std::string_literals;
    
    auto gl = [](auto x, auto y, auto z) {
        return x + y + z;
    };
    std::cout << gl(1, 2, 3) << "\n";
    std::cout << gl(1, 2, 3.3) << "\n";
    std::cout << gl("1"s, "2"s, "3"s) << "\n";
}
{% endhighlight %}

There are two different versions of the `gl` lambda there. One that takes all `int`s, and the other that takes all `std::string`s.
Of course we can also mix and match the types here, as long as `operator+` is defined for the combination.
All that happens is that a new version of that `gl` is instantiated for each different combination of argument types.

If we want to ([to use the paper's example](http://www.open-std.org/jtc1/sc22/wg21/docs/papers/2017/p0428r1.pdf)) define a lambda that is constrained to taking a `std::vector` of any type, or use a static member of a type? We can't easily do either with the `auto` syntax. So suddenly templates become very useful:

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

And, as a bonus, if we were to redefine `gl(x, y ,z)` from the `auto` example, as a template with `T` in place of `auto`, we can be assured that all parameters are the same type, if that's what we want... Just like real template functions...